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
        Schema::connection('app')->table('data_klaim', function (Blueprint $table) {
            // Add missing columns from JSON documentation - check if not exists
            if (!Schema::connection('app')->hasColumn('data_klaim', 'coder_nik')) {
                $table->string('coder_nik')->nullable()->after('metadata');
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'episodes')) {
                $table->text('episodes')->nullable()->after('coder_nik');
            }

            // Additional fields that might be missing - check if not exists
            if (!Schema::connection('app')->hasColumn('data_klaim', 'akses_naat')) {
                $table->string('akses_naat')->nullable();
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'isoman_ind')) {
                $table->boolean('isoman_ind')->default(false);
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'dializer_single_use')) {
                $table->integer('dializer_single_use')->default(0);
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'kantong_darah')) {
                $table->integer('kantong_darah')->default(0);
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'alteplase_ind')) {
                $table->boolean('alteplase_ind')->default(false);
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'kantong_jenazah')) {
                $table->integer('kantong_jenazah')->default(0);
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'peti_jenazah')) {
                $table->integer('peti_jenazah')->default(0);
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'plastik_erat')) {
                $table->integer('plastik_erat')->default(0);
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'desinfektan_jenazah')) {
                $table->integer('desinfektan_jenazah')->default(0);
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'mobil_jenazah')) {
                $table->integer('mobil_jenazah')->default(0);
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'desinfektan_mobil_jenazah')) {
                $table->integer('desinfektan_mobil_jenazah')->default(0);
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'terapi_konvalesen')) {
                $table->decimal('terapi_konvalesen', 15, 2)->default(0);
            }

            // ICU and medical fields - check if not exists
            if (!Schema::connection('app')->hasColumn('data_klaim', 'adl_sub_acute')) {
                $table->string('adl_sub_acute')->nullable();
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'adl_chronic')) {
                $table->string('adl_chronic')->nullable();
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'icu_indikator')) {
                $table->string('icu_indikator')->nullable();
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'icu_los')) {
                $table->string('icu_los')->nullable();
            }

            // COVID-19 related fields - check if not exists
            if (!Schema::connection('app')->hasColumn('data_klaim', 'covid19_status_cd')) {
                $table->string('covid19_status_cd')->nullable();
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'covid19_cc_ind')) {
                $table->boolean('covid19_cc_ind')->default(false);
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'covid19_rs_darurat_ind')) {
                $table->boolean('covid19_rs_darurat_ind')->default(false);
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'covid19_co_insidense_ind')) {
                $table->boolean('covid19_co_insidense_ind')->default(false);
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'covid19_penunjang_pengurang')) {
                $table->text('covid19_penunjang_pengurang')->nullable();
            }

            // Tarif/Payor fields - check if not exists  
            if (!Schema::connection('app')->hasColumn('data_klaim', 'nomor_kartu_t')) {
                $table->string('nomor_kartu_t')->nullable();
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'kode_tarif')) {
                $table->string('kode_tarif')->nullable();
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'payor_id')) {
                $table->string('payor_id')->nullable();
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'payor_cd')) {
                $table->string('payor_cd')->nullable();
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'cob_cd')) {
                $table->string('cob_cd')->nullable();
            }

            // Missing tariff columns from frontend TarifTab - check if not exists
            if (!Schema::connection('app')->hasColumn('data_klaim', 'tenaga_ahli')) {
                $table->decimal('tenaga_ahli', 15, 2)->default(0);
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'radiologi')) {
                $table->decimal('radiologi', 15, 2)->default(0);
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'laboratorium')) {
                $table->decimal('laboratorium', 15, 2)->default(0);
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'kamar')) {
                $table->decimal('kamar', 15, 2)->default(0);
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'rawat_intensif')) {
                $table->decimal('rawat_intensif', 15, 2)->default(0);
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'obat_kronis')) {
                $table->decimal('obat_kronis', 15, 2)->default(0);
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'obat_kemoterapi')) {
                $table->decimal('obat_kemoterapi', 15, 2)->default(0);
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'alkes')) {
                $table->decimal('alkes', 15, 2)->default(0);
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'bmhp')) {
                $table->decimal('bmhp', 15, 2)->default(0);
            }

            // Missing ventilator fields from frontend
            if (!Schema::connection('app')->hasColumn('data_klaim', 'ventilator_use_ind')) {
                $table->string('ventilator_use_ind')->default('0');
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'ventilator_start_dttm')) {
                $table->datetime('ventilator_start_dttm')->nullable();
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'ventilator_stop_dttm')) {
                $table->datetime('ventilator_stop_dttm')->nullable();
            }

            // JSON structure fields
            if (!Schema::connection('app')->hasColumn('data_klaim', 'apgar')) {
                $table->json('apgar')->nullable();
            }
            if (!Schema::connection('app')->hasColumn('data_klaim', 'persalinan')) {
                $table->json('persalinan')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('app')->table('data_klaim', function (Blueprint $table) {
            $table->dropColumn([
                'coder_nik',
                'episodes',
                'akses_naat',
                'isoman_ind',
                'dializer_single_use',
                'kantong_darah',
                'alteplase_ind',
                'kantong_jenazah',
                'peti_jenazah',
                'plastik_erat',
                'desinfektan_jenazah',
                'mobil_jenazah',
                'desinfektan_mobil_jenazah',
                'terapi_konvalesen',
                'adl_sub_acute',
                'adl_chronic',
                'icu_indikator',
                'icu_los',
                'covid19_status_cd',
                'covid19_cc_ind',
                'covid19_rs_darurat_ind',
                'covid19_co_insidense_ind',
                'covid19_penunjang_pengurang',
                'nomor_kartu_t',
                'kode_tarif',
                'payor_id',
                'payor_cd',
                'cob_cd',
                'tenaga_ahli',
                'radiologi',
                'laboratorium',
                'kamar',
                'rawat_intensif',
                'obat_kronis',
                'obat_kemoterapi',
                'alkes',
                'bmhp',
                'ventilator_use_ind',
                'ventilator_start_dttm',
                'ventilator_stop_dttm',
                'apgar',
                'persalinan',
            ]);
        });
    }
};
