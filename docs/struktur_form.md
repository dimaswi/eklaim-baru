tab pertama, data diri
- "nomor_sep" -> required
- "nomor_kartu" -> required
- "tgl_masuk" -> required
- "tgl_pulang" -> required
- "cara_masuk" -> required
- "jenis_rawat" -> required
- "kelas_rawat" -> required

tab kedua, icu
- "adl_sub_acute" -> optional
- "adl_chronic" -> optional
- "icu_indikator" -> optional
- "icu_los" -> optional

tab ketiga, ventilator
- "ventilator_hour" -> penggunaan dihitung dari start_dttm dan stop_dttm, optional
- "use_ind" -> optional
- "start_dttm" -> optional
- "stop_dttm" -> optional

tab keempat, upgrade kelas
- "upgrade_class_ind" -> optional
- "upgrade_class_class" -> optional
- "upgrade_class_los" -> optional
- "upgrade_class_payor" -> optional
- "add_payment_pct" -> optional

tab kelima, data medis
- "birth_weight" -> optional
- "sistole" -> required
- "diastole" -> required
- "discharge_status" -> required
- "diagnosa" -> required
- "procedure" -> required
- "diagnosa_inagrouper" -> required,
- "procedure_inagrouper" -> required

tab keenam, tarif
- "prosedur_non_bedah" -> required, default "0",
- "prosedur_bedah" -> required, default "0",
- "konsultasi" -> required, default "0",
- "tenaga_ahli" -> required, default "0",
- "keperawatan" -> required, default "0",
- "penunjang" -> required, default "0",
- "radiologi" -> required, default "0",
- "laboratorium" -> required, default "0",
- "pelayanan_darah" -> required, default "0",
- "rehabilitasi" -> required, default "0",
- "kamar" -> required, default "0",
- "rawat_intensif" -> required, default "0",
- "obat" -> required, default "0",
- "obat_kronis" -> required, default "0",
- "obat_kemoterapi" -> required, default "0",
- "alkes" -> required, default "0",
- "bmhp" -> required, default "0",
- "sewa_alat" -> required, default "0"

tab ketujuh, covid-19
- "pemulasaraan_jenazah" -> optional,
- "kantong_jenazah" -> optional,
- "peti_jenazah" -> optional,
- "plastik_erat" -> optional,
- "desinfektan_jenazah" -> optional,
- "mobil_jenazah" -> optional,
- "desinfektan_mobil_jenazah" -> optional,
- "covid19_status_cd" -> optional,
- "nomor_kartu_t" -> optional,
- "episodes" -> optional,
- "covid19_cc_ind" -> optional,
- "covid19_rs_darurat_ind" -> optional,
- "covid19_co_insidense_ind" -> optional,
- "covid19_penunjang_pengurang" : {
      "lab_asam_laktat" -> optional,
      "lab_procalcitonin" -> optional,
      "lab_crp" -> optional,
      "lab_kultur": optional,
      "lab_d_dimer": optional,
      "lab_pt": optional,
      "lab_aptt": optional,
      "lab_waktu_pendarahan": optional,
      "lab_anti_hiv": optional,
      "lab_analisa_gas": optional,
      "lab_albumin": optional,
      "rad_thorax_ap_pa": optional
      },

tab kedelapan, apgar score
- "apgar": {
      "menit_1": {
        "appearance" -> optional,
        "pulse" -> optional,
        "grimace" -> optional,
        "activity" -> optional,
        "respiration" -> optional
      },
      "menit_5": {
        "appearance" -> optional,
        "pulse" -> optional,
        "grimace" -> optional,
        "activity" -> optional,
        "respiration" -> optional
      }
    },

- tab kesembilan, persalinan
"persalinan": {
      "usia_kehamilan" -> optional,
      "gravida" -> optional,
      "partus" -> optional,
      "abortus" -> optional,
      "onset_kontraksi" -> optional,
      "delivery": [ -> multiple entries
        {
          "delivery_sequence" -> optional,
          "delivery_method" -> optional,
          "delivery_dttm" -> optional,
          "letak_janin" -> optional,
          "kondisi" -> optional,
          "use_manual" -> optional,
          "use_forcep" -> optional,
          "use_vacuum" -> optional,
          "shk_spesimen_ambil" -> optional,
          "shk_lokasi" -> optional,
          "shk_spesimen_dttm" -> optional
        },
        {
          "delivery_sequence" -> optional,
          "delivery_method" -> optional,
          "delivery_dttm" -> optional,
          "letak_janin" -> optional,
          "kondisi" -> optional,
          "use_manual" -> optional,
          "use_forcep" -> optional,
          "use_vacuum" -> optional,
          "shk_spesimen_ambil" -> optional,
          "shk_alasan" -> optional
        }
      ]
    },

tab kesepuluh, lain-lain
- "terapi_konvalesen" -> optional,
- "akses_naat" -> optional,
- "isoman_ind" -> optional,
- "bayi_lahir_status_cd" -> optional,
- "dializer_single_use" -> optional,
- "kantong_darah" -> optional,
- "alteplase_ind" -> optional,

tab kesebelas, data rumah sakit
- "tarif_poli_eks": "100000",
- "nama_dokter": "RUDY, DR",
- "kode_tarif": "AP",
- "payor_id": "3",
- "payor_cd": "JKN",
- "cob_cd": "0001",
- "coder_nik": "123123123123"