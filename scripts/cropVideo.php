<?php
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);
ini_set('error_log', __DIR__ . '/php_errors.log');

function logMessage($message)
{
    error_log(date('Y-m-d H:i:s') . ' - ' . $message . "\n", 3, __DIR__ . '/cropVideo.log');
}

logMessage('Début du script cropVideo.php');

function outputJson($success, $message)
{
    echo json_encode(['success' => $success, 'message' => $message]);
    logMessage("Sortie JSON: " . json_encode(['success' => $success, 'message' => $message]));
    exit;
}

function createDirectory($dir)
{
    if (!file_exists($dir)) {
        if (!@mkdir($dir, 0777, true)) {
            $error = error_get_last();
            throw new Exception("Failed to create directory: $dir. Reason: " . $error['message']);
        }
        logMessage("Directory created: $dir");
    }
}

try {
    $userId = isset($argv[1]) ? trim($argv[1]) : '';
    $projectName = isset($argv[2]) ? trim($argv[2]) : '';
    $resolution = isset($argv[3]) ? trim($argv[3]) : 'original';

    logMessage("Arguments reçus: userId=$userId, projectName=$projectName, resolution=$resolution");

    if (empty($userId) || empty($projectName)) {
        outputJson(false, "L'ID de l'utilisateur et le nom du projet ne peuvent pas être vides.");
    }

    $baseDir = dirname(__DIR__) . '/projets';
    $userDir = $baseDir . '/' . $userId;
    $inputFolder = $userDir . '/uploaded_videos/' . $projectName;
    $outputFolder = $userDir . '/processed_videos/' . $projectName;

    $dirsToCreate = [
        $baseDir,
        $userDir,
        $userDir . '/uploaded_videos',
        $userDir . '/processed_videos',
        $inputFolder,
        $outputFolder
    ];

    foreach ($dirsToCreate as $dir) {
        createDirectory($dir);
    }

    logMessage("Dossier d'entrée: $inputFolder");
    logMessage("Dossier de sortie: $outputFolder");

    if (count(glob("$inputFolder/*")) === 0) {
        outputJson(false, "Le dossier d'entrée est vide: $inputFolder");
    }

    $pythonScript = realpath(__DIR__ . '/crop_video.py');
    $command = escapeshellcmd("python3 $pythonScript " .
        escapeshellarg($inputFolder) . " " .
        escapeshellarg($outputFolder) . " " .
        escapeshellarg($projectName) . " " .
        escapeshellarg($resolution));
    logMessage("Commande à exécuter: $command");

    $output = shell_exec($command . " 2>&1");
    logMessage("Sortie de la commande Python: $output");

    if ($output === null) {
        throw new Exception("Erreur lors de l'exécution de la commande Python");
    }

    if (strpos($output, 'Error:') !== false || strpos($output, 'Traceback') !== false) {
        outputJson(false, $output);
    }

    $outputFiles = glob("$outputFolder/*");
    if (empty($outputFiles)) {
        outputJson(false, "Aucun fichier généré dans le dossier de sortie.");
    } else {
        outputJson(true, "Les vidéos ont été générées avec succès. Fichiers générés: " . implode(', ', array_map('basename', $outputFiles)));
    }
} catch (Exception $e) {
    logMessage("Exception: " . $e->getMessage());
    outputJson(false, "Une erreur est survenue: " . $e->getMessage());
}

logMessage('Fin du script cropVideo.php');
