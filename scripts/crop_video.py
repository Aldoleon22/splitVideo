import sys
import os
import logging
from scenedetect import detect, AdaptiveDetector, split_video_ffmpeg
import subprocess
import json

def setup_logging(log_file):
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler(sys.stdout)
        ]
    )

def get_video_info(input_path):
    command = [
        'ffprobe',
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        '-show_streams',
        input_path
    ]
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0:
        raise Exception(f"FFprobe command failed: {result.stderr}")
    
    info = json.loads(result.stdout)
    video_stream = next(s for s in info['streams'] if s['codec_type'] == 'video')
    return int(video_stream['width']), int(video_stream['height'])

def calculate_new_dimensions(current_width, current_height, target_resolution):
    target_width, target_height = map(int, target_resolution.split('x'))
    
    # Calculate aspect ratios
    current_ratio = current_width / current_height
    target_ratio = target_width / target_height
    
    if current_ratio > target_ratio:
        # Width is the limiting factor
        new_width = target_width
        new_height = int(new_width / current_ratio)
    else:
        # Height is the limiting factor
        new_height = target_height
        new_width = int(new_height * current_ratio)
    
    return f"{new_width}:{new_height}"

def resize_video(input_path, output_path, resolution):
    current_width, current_height = get_video_info(input_path)
    new_dimensions = calculate_new_dimensions(current_width, current_height, resolution)
    
    command = [
        'ffmpeg',
        '-i', input_path,
        '-vf', f'scale={new_dimensions}',
        '-c:a', 'copy',
        output_path
    ]
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0:
        logging.error(f"Error resizing video: {result.stderr}")
        raise Exception(f"FFmpeg command failed: {result.stderr}")

def main(input_folder, output_folder, project_name, resolution):
    logging.info(f"Input folder: {input_folder}")
    logging.info(f"Output folder: {output_folder}")
    logging.info(f"Project name: {project_name}")
    logging.info(f"Resolution: {resolution}")

    if not os.path.exists(input_folder):
        logging.error(f"Input folder does not exist: {input_folder}")
        print(f"Error: Input folder does not exist: {input_folder}")
        return 1

    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        logging.info(f"Created output folder: {output_folder}")

    input_files = [f for f in os.listdir(input_folder) if f.endswith(('.mp4', '.avi', '.mkv', '.mov', '.flv'))]
    
    if not input_files:
        logging.error("No supported video files found in the input folder.")
        print("Error: No supported video files found in the input folder.")
        return 1

    for input_file in input_files:
        input_path = os.path.join(input_folder, input_file)
        logging.info(f"Processing file: {input_path}")

        try:
            scene_list = detect(input_path, AdaptiveDetector())
            logging.info(f"Detected {len(scene_list)} scenes")

            if not scene_list:
                logging.warning("No scenes detected in the video.")
                print("Warning: No scenes detected in the video.")
                continue

            split_video_ffmpeg(input_path, scene_list, output_dir=output_folder, show_progress=True)
            logging.info(f"Video successfully processed and saved in {output_folder}")

            if resolution != 'original':
                for output_file in os.listdir(output_folder):
                    if output_file.endswith(('.mp4', '.avi', '.mkv', '.mov', '.flv')):
                        output_path = os.path.join(output_folder, output_file)
                        resized_path = os.path.join(output_folder, f"resized_{output_file}")
                        try:
                            resize_video(output_path, resized_path, resolution)
                            os.remove(output_path)
                            os.rename(resized_path, output_path)
                            logging.info(f"Successfully resized and replaced: {output_file}")
                        except Exception as e:
                            logging.error(f"Error processing {output_file}: {str(e)}")
                logging.info(f"All videos processed for resolution: {resolution}")

        except Exception as e:
            logging.error(f"An error occurred while processing {input_file}: {str(e)}")
            print(f"Error: An error occurred while processing {input_file}: {str(e)}")

    output_files = os.listdir(output_folder)
    logging.info(f"Files in output folder: {', '.join(output_files)}")
    
    return 0

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python3 crop_video.py <input_folder> <output_folder> <project_name> <resolution>")
        sys.exit(1)
    
    input_folder = sys.argv[1]
    output_folder = sys.argv[2]
    project_name = sys.argv[3]
    resolution = sys.argv[4]

    log_file = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'crop_video.log')
    setup_logging(log_file)

    sys.exit(main(input_folder, output_folder, project_name, resolution))

