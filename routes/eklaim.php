<?php

use App\Http\Controllers\Eklaim\HasilLaboratoriumController;
use App\Http\Controllers\Eklaim\HasilRadiologiController;
use App\Http\Controllers\Eklaim\KlaimController;
use App\Http\Controllers\Eklaim\KunjunganBpjsController;
use App\Http\Controllers\Eklaim\PasienController;
use App\Http\Controllers\Eklaim\PengajuanKlaimController;
use App\Http\Controllers\Eklaim\PrintBundleController;
use App\Http\Controllers\Eklaim\RawatInapBalanceCairanController;
use App\Http\Controllers\Eklaim\RawatInapCPPTController;
use App\Http\Controllers\Eklaim\RawatInapPengkajianAwalController;
use App\Http\Controllers\Eklaim\RawatInapResumeMedisController;
use App\Http\Controllers\Eklaim\RawatJalanPengkajianAwalController;
use App\Http\Controllers\Eklaim\RawatJalanResumeMedisController;
use App\Http\Controllers\Eklaim\ReferensiController;
use App\Http\Controllers\Eklaim\TagihanController;
use App\Http\Controllers\Eklaim\UGDPengkajianAwalController;
use App\Http\Controllers\Eklaim\UGDResumeMedisController;
use App\Http\Controllers\Eklaim\UGDTriageController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/eklaim/kunjungan', [KunjunganBpjsController::class, 'index'])->name('eklaim.kunjungan.index')->middleware('permission:kunjungan.view');
    Route::post('/eklaim/kunjungan/pengajuan-klaim', [KunjunganBpjsController::class, 'pengajuanKlaim'])->name('eklaim.kunjungan.pengajuan-klaim')->middleware('permission:kunjungan.ajukan-klaim');
    Route::post('/eklaim/groupper', [KunjunganBpjsController::class, 'doGroupping'])->name('eklaim.groupper')->middleware('permission:kunjungan.view');
    
    Route::get('/eklaim/pengajuan', [PengajuanKlaimController::class, 'index'])->name('eklaim.pengajuan.index')->middleware('permission:pengajuan-klaim.view');
    Route::get('/eklaim/pengajuan/{id}/rm', [PengajuanKlaimController::class, 'show'])->name('eklaim.pengajuan.show')->middleware('permission:pengajuan-klaim.view');
    
    // Print Bundle Routes - POST only for form submissions with selected_records
    Route::get('/eklaim/print-bundle/{pengajuan}', [PrintBundleController::class, 'index'])->name('eklaim.print-bundle.index')->middleware(['permission:pengajuan-klaim.view']);
    
    // Preview routes - POST only for form submission with selected_records
    Route::post('/eklaim/print-bundle/{pengajuan}/preview', [PrintBundleController::class, 'generatePreview'])->name('eklaim.print-bundle.preview')->middleware(['permission:pengajuan-klaim.view']);
    
    // PDF generation routes - POST only for form submission with selected_records
    Route::post('/eklaim/print-bundle/{pengajuan}/pdf', [PrintBundleController::class, 'generatePDF'])->name('eklaim.print-bundle.pdf')->middleware(['permission:pengajuan-klaim.view']);
    
    // Bundle generation - POST only
    Route::post('/eklaim/print-bundle/{pengajuan}/bundle', [PrintBundleController::class, 'generateBundle'])->name('eklaim.print-bundle.bundle')->middleware(['permission:pengajuan-klaim.view', 'production.csrf']);
    
    // Default order management routes
    Route::get('/eklaim/print-bundle/{pengajuan}/default-order', [PrintBundleController::class, 'getDefaultOrder'])->name('eklaim.print-bundle.default-order.get')->middleware(['permission:pengajuan-klaim.view']);
    Route::post('/eklaim/print-bundle/{pengajuan}/default-order', [PrintBundleController::class, 'updateDefaultOrder'])->name('eklaim.print-bundle.default-order.update')->middleware(['permission:pengajuan-klaim.view']);
    Route::delete('/eklaim/print-bundle/{pengajuan}/default-order', [PrintBundleController::class, 'clearDefaultOrder'])->name('eklaim.print-bundle.default-order.clear')->middleware(['permission:pengajuan-klaim.view']);
    
    // Admin routes for managing all saved settings
    Route::get('/eklaim/print-bundle/settings/all', [PrintBundleController::class, 'getAllSavedSettingsApi'])->name('eklaim.print-bundle.settings.all')->middleware(['permission:pengajuan-klaim.view']);
});

//Pengajuan Klaim Ke Inacbg
Route::middleware('auth')->group(function () {
    Route::get('/eklaim/klaim/{pengajuanKlaim}', [KlaimController::class, 'index'])->name('eklaim.klaim.index');
    Route::post('/eklaim/klaim/{pengajuanKlaim}/store-progress', [KlaimController::class, 'storeProgress'])->name('eklaim.klaim.store-progress');
    Route::post('/eklaim/klaim/{pengajuanKlaim}/submit', [KlaimController::class, 'submitKlaim'])->name('eklaim.klaim.submit');
    Route::post('/eklaim/klaim/{pengajuanKlaim}/groupper', [KlaimController::class, 'groupper'])->name('eklaim.klaim.groupper');
    Route::post('/eklaim/klaim/{pengajuanKlaim}/final', [KlaimController::class, 'final'])->name('eklaim.klaim.final');
    Route::post('/eklaim/klaim/{pengajuanKlaim}/reedit', [KlaimController::class, 'reedit'])->name('eklaim.klaim.reedit');
    Route::post('/eklaim/klaim/{pengajuanKlaim}/kirim-inacbg', [KlaimController::class, 'kirimInacbg'])->name('eklaim.klaim.kirim-inacbg');
    Route::post('/eklaim/klaim/{pengajuanKlaim}/idrg-grouping', [KlaimController::class, 'idrgGrouping'])->name('eklaim.klaim.idrg-grouping');
    
    
    // Debug route for testing data storage
    Route::get('/eklaim/debug/test-storage/{pengajuanKlaim}', [KlaimController::class, 'testStorage'])->name('eklaim.debug.test-storage');
});


// Resume Medis Rawat Inap 
Route::middleware('auth')->group(function () {
        Route::get('/eklaim/pengajuan/{pengajuan}/rm/rawat-inap/resume-medis/{kunjungan}', [RawatInapResumeMedisController::class, 'index'])->name('eklaim.pengajuan.rm.rawat-inap.resume-medis')->middleware('permission:pengajuan-klaim.view');
        Route::get('/eklaim/rawat-inap/resume-medis/{kunjungan}', [RawatInapResumeMedisController::class, 'getResumeMedisData'])->name('eklaim.rawat-inap.resume-medis')->middleware('permission:pengajuan-klaim.view');
        Route::post('/eklaim/rawat-inap/resume-medis/{kunjungan}/store', [RawatInapResumeMedisController::class, 'store'])->name('eklaim.rawat-inap.resume-medis.store')->middleware('permission:pengajuan-klaim.view');
        Route::post('/eklaim/rawat-inap/resume-medis', [RawatInapResumeMedisController::class, 'store'])->name('eklaim.rawat-inap.resume-medis.store.direct')->middleware('permission:pengajuan-klaim.view');
});

// Pengkajian Awal Rawat Inap
Route::middleware('auth')->group(function () {
        Route::get('/eklaim/pengajuan/{pengajuan}/rm/rawat-inap/pengkajian-awal/{kunjungan}', [RawatInapPengkajianAwalController::class, 'index'])->name('eklaim.pengajuan.rm.rawat-inap.pengkajian-awal')->middleware('permission:pengajuan-klaim.view');
        Route::get('/eklaim/rawat-inap/pengkajian-awal/{kunjungan}', [RawatInapPengkajianAwalController::class, 'getPengkajianAwalData'])->name('eklaim.rawat-inap.pengkajian-awal')->middleware('permission:pengajuan-klaim.view');
        Route::post('/eklaim/rawat-inap/pengkajian-awal/{kunjungan}/store', [RawatInapPengkajianAwalController::class, 'store'])->name('eklaim.rawat-inap.pengkajian-awal.store')->middleware('permission:pengajuan-klaim.view');
        Route::post('/eklaim/rawat-inap/pengkajian-awal', [RawatInapPengkajianAwalController::class, 'store'])->name('eklaim.rawat-inap.pengkajian-awal.store.direct')->middleware('permission:pengajuan-klaim.view');
});

// CPPT Rawat Inap
Route::middleware('auth')->group(function () {
        Route::get('/eklaim/pengajuan/{pengajuan}/rm/rawat-inap/cppt/{kunjungan}', [RawatInapCPPTController::class, 'index'])->name('eklaim.pengajuan.rm.rawat-inap.cppt')->middleware('permission:pengajuan-klaim.view');
        Route::get('/eklaim/rawat-inap/cppt/{kunjungan}', [RawatInapCPPTController::class, 'getCPPTData'])->name('eklaim.rawat-inap.cppt')->middleware('permission:pengajuan-klaim.view');
        Route::post('/eklaim/rawat-inap/cppt/{kunjungan}/store', [RawatInapCPPTController::class, 'store'])->name('eklaim.rawat-inap.cppt.store')->middleware('permission:pengajuan-klaim.view');
});

// Balance Cairan Rawat Inap
Route::middleware('auth')->group(function () {
        Route::get('/eklaim/pengajuan/{pengajuan}/rm/rawat-inap/balance-cairan/{kunjungan}', [RawatInapBalanceCairanController::class, 'index'])->name('eklaim.pengajuan.rm.rawat-inap.balance-cairan')->middleware('permission:pengajuan-klaim.view');
        Route::get('/eklaim/rawat-inap/balance-cairan/{kunjungan}', [RawatInapBalanceCairanController::class, 'getBalanceCairanData'])->name('eklaim.rawat-inap.balance-cairan')->middleware('permission:pengajuan-klaim.view');
        Route::post('/eklaim/rawat-inap/balance-cairan/{kunjungan}/store', [RawatInapBalanceCairanController::class, 'store'])->name('eklaim.rawat-inap.balance-cairan.store')->middleware('permission:pengajuan-klaim.view');
});

// Resume Medis Rawat Jalan 
Route::middleware('auth')->group(function () {
        Route::get('/eklaim/pengajuan/{pengajuan}/rm/rawat-jalan/resume-medis/{kunjungan}', [RawatJalanResumeMedisController::class, 'index'])->name('eklaim.pengajuan.rm.rawat-jalan.resume-medis')->middleware('permission:pengajuan-klaim.view');
        Route::get('/eklaim/rawat-jalan/resume-medis/{kunjungan}', [RawatJalanResumeMedisController::class, 'getResumeMedisData'])->name('eklaim.rawat-jalan.resume-medis')->middleware('permission:pengajuan-klaim.view');
        Route::post('/eklaim/rawat-jalan/resume-medis/{kunjungan}/store', [RawatJalanResumeMedisController::class, 'store'])->name('eklaim.rawat-jalan.resume-medis.store')->middleware('permission:pengajuan-klaim.view');
        Route::post('/eklaim/rawat-jalan/resume-medis', [RawatJalanResumeMedisController::class, 'store'])->name('eklaim.rawat-jalan.resume-medis.store.direct')->middleware('permission:pengajuan-klaim.view');
});

// Pengkajian Awal Rawat Jalan
Route::middleware('auth')->group(function () {
        Route::get('/eklaim/pengajuan/{pengajuan}/rm/rawat-jalan/pengkajian-awal/{kunjungan}', [RawatJalanPengkajianAwalController::class, 'index'])->name('eklaim.pengajuan.rm.rawat-jalan.pengkajian-awal')->middleware('permission:pengajuan-klaim.view');
        Route::get('/eklaim/rawat-jalan/pengkajian-awal/{kunjungan}', [RawatJalanPengkajianAwalController::class, 'getPengkajianAwalData'])->name('eklaim.rawat-jalan.pengkajian-awal')->middleware('permission:pengajuan-klaim.view');
        Route::post('/eklaim/rawat-jalan/pengkajian-awal/{kunjungan}/store', [RawatJalanPengkajianAwalController::class, 'store'])->name('eklaim.rawat-jalan.pengkajian-awal.store')->middleware('permission:pengajuan-klaim.view');
        Route::post('/eklaim/rawat-jalan/pengkajian-awal', [RawatJalanPengkajianAwalController::class, 'store'])->name('eklaim.rawat-jalan.pengkajian-awal.store.direct')->middleware('permission:pengajuan-klaim.view');
});

// Resume Medis UGD
Route::middleware('auth')->group(function () {
        Route::get('/eklaim/pengajuan/{pengajuan}/rm/ugd/resume-medis/{kunjungan}', [UGDResumeMedisController::class, 'index'])->name('eklaim.pengajuan.rm.UGD.resume-medis')->middleware('permission:pengajuan-klaim.view');
        Route::get('/eklaim/ugd/resume-medis/{kunjungan}', [UGDResumeMedisController::class, 'getResumeMedisData'])->name('eklaim.UGD.resume-medis')->middleware('permission:pengajuan-klaim.view');
        Route::post('/eklaim/ugd/resume-medis/{kunjungan}/store', [UGDResumeMedisController::class, 'store'])->name('eklaim.ugd.resume-medis.store')->middleware('permission:pengajuan-klaim.view');
        Route::post('/eklaim/ugd/resume-medis', [UGDResumeMedisController::class, 'store'])->name('eklaim.ugd.resume-medis.store.direct')->middleware('permission:pengajuan-klaim.view');
});

// Pengkajian Awal UGD
Route::middleware('auth')->group(function () {
        Route::get('/eklaim/pengajuan/{pengajuan}/rm/ugd/pengkajian-awal/{kunjungan}', [UGDPengkajianAwalController::class, 'index'])->name('eklaim.pengajuan.rm.UGD.pengkajian-awal')->middleware('permission:pengajuan-klaim.view');
        Route::get('/eklaim/ugd/pengkajian-awal/{kunjungan}', [UGDPengkajianAwalController::class, 'getPengkajianAwalData'])->name('eklaim.UGD.pengkajian-awal')->middleware('permission:pengajuan-klaim.view');
        Route::post('/eklaim/ugd/pengkajian-awal/{kunjungan}/store', [UGDPengkajianAwalController::class, 'store'])->name('eklaim.ugd.pengkajian-awal.store')->middleware('permission:pengajuan-klaim.view');
        Route::post('/eklaim/ugd/pengkajian-awal', [UGDPengkajianAwalController::class, 'store'])->name('eklaim.ugd.pengkajian-awal.store.direct')->middleware('permission:pengajuan-klaim.view');
        Route::post('/eklaim/ugd/pengkajian-awal', [UGDPengkajianAwalController::class, 'store'])->name('eklaim.ugd.pengkajian-awal.store.direct')->middleware('permission:pengajuan-klaim.view');
});

// Triage Awal UGD
Route::middleware('auth')->group(function () {
        Route::get('/eklaim/pengajuan/{pengajuan}/rm/ugd/triage/{kunjungan}', [UGDTriageController::class, 'index'])->name('eklaim.pengajuan.rm.UGD.triage')->middleware('permission:pengajuan-klaim.view');
        Route::get('/eklaim/ugd/triage/{kunjungan}', [UGDTriageController::class, 'getTriageData'])->name('eklaim.UGD.triage')->middleware('permission:pengajuan-klaim.view');
        Route::post('/eklaim/ugd/triage/{kunjungan}/store', [UGDTriageController::class, 'store'])->name('eklaim.ugd.triage.store')->middleware('permission:pengajuan-klaim.view');
});

// Tagihan
Route::middleware('auth')->group(function () {
    Route::get('/eklaim/pengajuan/{pengajuan}/rm/tagihan', [TagihanController::class, 'index'])->name('eklaim.pengajuan.rm.tagihan')->middleware('permission:pengajuan-klaim.view');
    Route::get('/eklaim/tagihan/{kunjungan}', [TagihanController::class, 'getTagihanData'])->name('eklaim.tagihan')->middleware('permission:pengajuan-klaim.view');
    Route::post('/eklaim/pengajuan/{pengajuan}/tagihan/store', [TagihanController::class, 'store'])->name('eklaim.tagihan.store')->middleware('permission:pengajuan-klaim.view');
});

//Hasil Lab 
Route::middleware('auth')->group(function () {
        Route::get('/eklaim/pengajuan/{pengajuan}/rm/laboratorium/hasil/{kunjungan}', [HasilLaboratoriumController::class, 'index'])->name('eklaim.pengajuan.rm.laboratorium.hasil')->middleware('permission:pengajuan-klaim.view');
        Route::get('/eklaim/laboratorium/hasil/{kunjungan}', [HasilLaboratoriumController::class, 'getHasilLaboratoriumData'])->name('eklaim.laboratorium.hasil')->middleware('permission:pengajuan-klaim.view');
        Route::post('/eklaim/laboratorium/hasil/{kunjungan}/store', [HasilLaboratoriumController::class, 'store'])->name('eklaim.laboratorium.hasil.store')->middleware('permission:pengajuan-klaim.view');
        Route::post('/eklaim/laboratorium/fiktif/store', [HasilLaboratoriumController::class, 'storeFiktif'])->name('eklaim.laboratorium.fiktif.store')->middleware('permission:pengajuan-klaim.view');
        Route::delete('/eklaim/laboratorium/fiktif/{id}', [HasilLaboratoriumController::class, 'deleteFiktif'])->name('eklaim.laboratorium.fiktif.delete')->middleware('permission:pengajuan-klaim.view');
});

// Hasil Radiologi
Route::middleware('auth')->group(function () {
        Route::get('/eklaim/pengajuan/{pengajuan}/rm/radiologi/hasil/{kunjungan}', [HasilRadiologiController::class, 'index'])->name('eklaim.pengajuan.rm.radiologi.hasil')->middleware('permission:pengajuan-klaim.view');
        Route::get('/eklaim/radiologi/hasil/{kunjungan}', [HasilRadiologiController::class, 'getHasilRadiologiData'])->name('eklaim.radiologi.hasil')->middleware('permission:pengajuan-klaim.view');
        Route::post('/eklaim/radiologi/hasil/{kunjungan}/store', [HasilRadiologiController::class, 'store'])->name('eklaim.radiologi.hasil.store')->middleware('permission:pengajuan-klaim.view');
        Route::post('/eklaim/radiologi/fiktif/store', [HasilRadiologiController::class, 'storeFiktif'])->name('eklaim.radiologi.fiktif.store')->middleware('permission:pengajuan-klaim.view');
        Route::delete('/eklaim/radiologi/fiktif/{id}', [HasilRadiologiController::class, 'deleteFiktif'])->name('eklaim.radiologi.fiktif.delete')->middleware('permission:pengajuan-klaim.view');
});

// API REFERENSI
Route::middleware('auth')->group(function () {
    Route::get('/eklaim/referensi/diagnosis', [ReferensiController::class, 'getDiagnosis'])->name('eklaim.referensi.diagnosis');
    Route::get('/eklaim/referensi/prosedur', [ReferensiController::class, 'getProsedur'])->name('eklaim.referensi.prosedur');
    Route::get('/eklaim/referensi/diagnosis-idrg', [ReferensiController::class, 'getDiagnosisIDRG'])->name('eklaim.referensi.diagnosis-idrg');
    Route::get('/eklaim/referensi/prosedur-idrg', [ReferensiController::class, 'getProsedurIDRG'])->name('eklaim.referensi.prosedur-idrg');
});
