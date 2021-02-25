<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
Route::get('locations', 'LocationController@index');
Route::get('locations/{id}', 'LocationController@show');
Route::get('locations/search/{search_text}', 'LocationController@search');
Route::post('locations', 'LocationController@store');
Route::post('locations/getDetail', 'LocationController@details');

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});
