<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('app')->create('pengajuan_klaim', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_sep', 50)->index();
            $table->date('tanggal_pengajuan');
            $table->date('tanggal_masuk')->nullable();
            $table->date('tanggal_keluar')->nullable();
            $table->string('norm', 20);
            $table->tinyInteger('status_pengiriman')->default(0)->comment('0=Default, 1=Tersimpan, 2=Grouper, 3=Grouper Stage 2, 4=Final, 5=Kirim');
            $table->text('response_message')->nullable();
            $table->text('response_data')->nullable(); // JSON response dari INACBG
            $table->string('nomor_kartu', 20)->nullable();
            $table->string('nama_pasien', 100)->nullable();
            $table->string('gender', 1)->nullable();
            $table->date('tgl_lahir')->nullable();
            $table->text('ruangan')->nullable(); // Nama ruangan atau bisa multiple ruangan
            $table->timestamps();
            
            // Indexes untuk performance
            $table->index(['nomor_sep', 'tanggal_pengajuan']);
            $table->index('status_pengiriman');
            $table->index('norm');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('app')->dropIfExists('pengajuan_klaim');
    }
};
