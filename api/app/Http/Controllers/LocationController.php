<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Location;
use GuzzleHttp\Client;

class LocationController extends Controller
{

    public function index()
    {
        return Location::all();
    }
 
    public function show($id)
    {
        return Location::find($id);
    }

    public function search(Request $request, $search_text)
    {
        $GOOGLE_API_KEY = "<KEY_HERE>";

        $location = "";
        if ($request->has('location')) {
            $location = $request->input('location');
        }
        $result = [];
        $db_res = Location::where('name', 'like', '%'.$search_text.'%')->orWhere('address', 'like', '%'.$search_text.'%')->get()->toArray();
        if (count($db_res) > 0) {
            $result = $db_res;
        } else {
            $client = new Client();
            $res = $client->get("https://maps.googleapis.com/maps/api/place/textsearch/json?query=$search_text&location=$location&radius=50000&key=".$GOOGLE_API_KEY);
            $google_result = json_decode($res->getBody());
            foreach ($google_result->results as $value) {
                array_push($result, [
                    "name" => $value->name,
                    "address" => $value->formatted_address,
                    "lat" => $value->geometry->location->lat,
                    "lng" => $value->geometry->location->lng
                ]);
            }
        }
        return $result;
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'address' => 'required',
            'lat' => 'required',
            'lng' => 'required',
        ],$message=[
            'required' => 'The :attribute field is required.',
        ]);
        return Location::create($request->all());
    }

    public function details(Request $request)
    {

        $GOOGLE_API_KEY = "<KEY_HERE>";

        $origins = $request->input('origins');
        $destinations = $request->input('destinations');
        $client = new Client();
        $res = $client->get("https://maps.googleapis.com/maps/api/distancematrix/json?origins=$origins&destinations=$destinations&mode=bike&key=".$GOOGLE_API_KEY);
        $google_result = json_decode($res->getBody());
        $result = array('distance' => $google_result->rows[0]->elements[0]->distance,'duration' => $google_result->rows[0]->elements[0]->duration);
       
        return $result;
    }

}
