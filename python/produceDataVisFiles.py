import json
import urllib2
import optparse

from pprint import pprint


def read_json(jsonFileName):

	json_data = open(jsonFileName)
	data = json.load(json_data)
	json_data.close()

	return data

def get_geolocation_of_city(city):

	try:
		geo_location_url = "http://nominatim.openstreetmap.org/search?q="+city+"&format=json&limit=1"
		geo_location_info = json.loads(urllib2.urlopen(geo_location_url).read())
		if len(geo_location_info) == 1:
			return geo_location_info[0]["lat"],geo_location_info[0]["lon"]
		else:
			return "NaN","NaN"
	except ValueError:
		return "NaN","NaN"

def make_n_laureats_outputfile(input_filename, output_filename, verbose):

	json_data = read_json(input_filename)
	
	cities = {}
	for laureate in json_data["laureates"]:
		if "bornCity" in laureate:
			city = laureate["bornCity"].split(',')[0]
			lat, lon = get_geolocation_of_city(city)
			
			if lat == "NaN" or lon == "NaN":
				continue

			if city not in cities:
				cities[city] = {}

			if "count" not in cities[city]:
				cities[city]["lat"] = lat
				cities[city]["long"] = lon
				cities[city]["count"] = 1
			else:
				cities[city]["lat"] = lat
				cities[city]["long"] = lon
				cities[city]["count"] += 1
	
	n_laureates = []
	for city, info in cities.iteritems():
		print city, info
		city_laureates = {"city_name": city, "lat": info["lat"], "long": info["long"], "nb_laureates": info["count"]}
		n_laureates.append(city_laureates)

	print n_laureates

	with open(output_filename, 'w') as outfile:
		json.dump(n_laureates, outfile)

def main():


	parser = optparse.OptionParser()
	parser.add_option('-o', '--output', 
    	              dest="output_filename", 
        	          default="default.out",
            	      )
	parser.add_option('-i', '--input', 
    	              dest="input_filename", 
        	          default="input.json",
            	      )
	parser.add_option('-v', '--verbose',
    	              dest="verbose",
        	          default=False,
            	      action="store_true",
                	  )
	parser.add_option('--version',
    	              dest="version",
        	          default=1.0,
            	      type="float",
                	  )
	parser.add_option('--dvtype','--data-vis-type',
    	              dest="dvtype",
        	          default="n_laureate")

	options, remainder = parser.parse_args()

	input_filename = options.input_filename
	output_filename = options.output_filename
	verbose = options.verbose
	
	if options.dvtype == "n_laureate":
		make_n_laureats_outputfile(input_filename, output_filename, verbose)


if __name__ == "__main__":
	main()
