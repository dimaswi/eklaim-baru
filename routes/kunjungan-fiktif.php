<?php

use App\Http\Controllers\KunjunganFiktifController;
use Illuminate\Support\Facades\Route;

Route::prefix('eklaim/kunjungan-fiktif')->name('kunjungan-fiktif.')->group(function () {
    // Halaman utama daftar kunjungan fiktif
    Route::get('/{pengajuanKlaimId}/daftar', [KunjunganFiktifController::class, 'daftarKunjunganFiktif'])
        ->name('daftar');

    // Laboratorium
    Route::get('/{pengajuanKlaimId}/laboratorium', [KunjunganFiktifController::class, 'laboratorium'])
        ->name('laboratorium.create');
    Route::post('/{pengajuanKlaimId}/laboratorium', [KunjunganFiktifController::class, 'storeLaboratorium'])
        ->name('laboratorium.store');
    Route::delete('/{pengajuanKlaimId}/laboratorium/{id}', [KunjunganFiktifController::class, 'hapusLaboratorium'])
        ->name('laboratorium.destroy');

    // Radiologi
    Route::get('/{pengajuanKlaimId}/radiologi', [KunjunganFiktifController::class, 'radiologi'])
        ->name('radiologi.create');
    Route::post('/{pengajuanKlaimId}/radiologi', [KunjunganFiktifController::class, 'storeRadiologi'])
        ->name('radiologi.store');
    Route::delete('/{pengajuanKlaimId}/radiologi/{id}', [KunjunganFiktifController::class, 'hapusRadiologi'])
        ->name('radiologi.destroy');
});
