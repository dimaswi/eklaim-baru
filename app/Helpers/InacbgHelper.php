<?php

namespace App\Helpers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class InacbgHelper
{
    public static function inacbg_encrypt($data, $key)
    {
        $key = hex2bin($key);
        if (mb_strlen($key, "8bit") !== 32) {
            return redirect()->back()->with("error", "Needs a 256-bit key!");
        }
        $iv_size = openssl_cipher_iv_length("aes-256-cbc");
        $iv = openssl_random_pseudo_bytes($iv_size); // dengan catatan dibawah
        $encrypted = openssl_encrypt(
            json_encode($data, JSON_UNESCAPED_UNICODE),
            "aes-256-cbc",
            $key,
            OPENSSL_RAW_DATA,
            $iv
        );
        $signature = mb_substr(hash_hmac(
            "sha256",
            $encrypted,
            $key,
            true
        ), 0, 10, "8bit");
        $encoded = chunk_split(base64_encode($signature . $iv . $encrypted));
        return $encoded;
    }

    public static function inacbg_decrypt($str, $strkey)
    {
        $key = hex2bin($strkey);
        if (mb_strlen($key, "8bit") !== 32) {
            return redirect()->back()->with("error", "Needs a 256-bit key!");
        }
        $iv_size = openssl_cipher_iv_length("aes-256-cbc");
        $decoded = base64_decode($str);
        $signature = mb_substr($decoded, 0, 10, "8bit");
        $iv = mb_substr($decoded, 10, $iv_size, "8bit");
        $encrypted = mb_substr($decoded, $iv_size + 10, NULL, "8bit");
        $calc_signature = mb_substr(hash_hmac(
            "sha256",
            $encrypted,
            $key,
            true
        ), 0, 10, "8bit");
        if (!self::inacbg_compare($signature, $calc_signature)) {
            return redirect()->back()->with("error", "SIGNATURE_NOT_MATCH");
        }

        $decrypted = openssl_decrypt(
            $encrypted,
            "aes-256-cbc",
            $key,
            OPENSSL_RAW_DATA,
            $iv
        );
        return $decrypted;
    }

    public static function inacbg_compare($a, $b)
    {
        if (strlen($a) !== strlen($b)) return false;

        $result = 0;
        for ($i = 0; $i < strlen($a); $i++) {
            $result |= ord($a[$i]) ^ ord($b[$i]);
        }

        return $result == 0;
    }

    public static function hitApi($data, $method = 'POST')
    {
        $key = env('INACBG_KEY');
        $json_request = json_decode(json_encode($data), true);
        
        $payload = self::inacbg_encrypt($json_request, $key);
        $header = array("Content-Type: application/x-www-form-urlencoded");
        $url = env('INACBG_URL');

        //SETUP CURL
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        // request dengan curl
        $response = curl_exec($ch);

        dd($response);

        $first = strpos($response, "\n") + 1;
        $last = strrpos($response, "\n") - 1;
        $response = substr(
            $response,
            $first,
            strlen($response) - $first - $last
        );
        // decrypt dengan fungsi inacbg_decrypt
        $response = self::inacbg_decrypt($response, $key);
        $msg = json_decode($response, true);
        return $msg;
    }
}
