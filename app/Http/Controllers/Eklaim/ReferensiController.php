<?php

namespace App\Http\Controllers\Eklaim;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Helpers\InacbgHelper;

class ReferensiController extends Controller
{
    public function getDiagnosis(Request $request)
    {
        $data = [
            "metadata" => [
                "method" => "search_diagnosis"
            ],
            "data" => [
                "keyword" => $request->get('keyword'),
            ]
        ];

        try {
            $response = InacbgHelper::hitApi($data);

            if ($response && isset($response['metadata']) && $response['metadata']['code'] == 200) {
                return response()->json($response);
            } else {
                $responseKosong = [
                    "metadata" => [
                        "code" => 200,
                        "message" => "Tidak Ada Data Diagnosis"
                    ],
                    "response" => [
                        "count" => 0,
                        "data" => []
                    ]
                ];
                return response()->json($responseKosong);
            }
        } catch (\Exception $e) {
            $errorResponse = [
                "metadata" => [
                    "code" => 500,
                    "message" => "Error: " . $e->getMessage()
                ],
                "response" => [
                    "count" => 0,
                    "data" => []
                ]
            ];
            return response()->json($errorResponse, 500);
        }
    }

    public function getProsedur(Request $request)
    {
        $data = [
            "metadata" => [
                "method" => "search_procedures"
            ],
            "data" => [
                "keyword" => $request->get('keyword')
            ]
        ];

        try {
            $response = InacbgHelper::hitApi($data);

            if ($response && isset($response['metadata']) && $response['metadata']['code'] == 200) {
                return response()->json($response);
            } else {
                $responseKosong = [
                    "metadata" => [
                        "code" => 200,
                        "message" => "Tidak Ada Data Procedure"
                    ],
                    "response" => [
                        "count" => 0,
                        "data" => []
                    ]
                ];
                return response()->json($responseKosong);
            }
        } catch (\Exception $e) {
            $errorResponse = [
                "metadata" => [
                    "code" => 500,
                    "message" => "Error: " . $e->getMessage()
                ],
                "response" => [
                    "count" => 0,
                    "data" => []
                ]
            ];
            return response()->json($errorResponse, 500);
        }
    }
}
