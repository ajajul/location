<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Location;

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

    public function search($search_text)
    {
        $locations = Location::where('name', 'like', '%'.$search_text.'%')->orWhere('address', 'like', '%'.$search_text.'%')->get()->all();
        // dd($locations);
        return $locations;
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

}
