<?php
require_once 'vendor/autoload.php';

// Simple test file to test resume medis spacing
echo "Testing Resume Medis dengan spacing besar...\n";
echo "Template sudah diupdate dengan:\n";
echo "1. margin-bottom: 300px untuk setiap .resume-report\n";
echo "2. margin-top: 200px + padding-top: 100px untuk record kedua dst\n";
echo "3. .record-separator dengan height: 200px antar record\n";
echo "\nCobalah akses halaman print bundle untuk test hasilnya:\n";
echo "http://localhost/eklaim/eklaim/print-bundle/{id_pengajuan}\n";
echo "\nAtau gunakan route preview:\n";
echo "POST /eklaim/print-bundle/{id_pengajuan}/preview\n";
echo "dengan data: { 'templates': ['resume_medis'], 'records': {...} }\n";
?>
