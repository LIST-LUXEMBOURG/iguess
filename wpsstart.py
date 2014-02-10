import sys, ast, getopt, types, WPSClient, time, syslog 
# from locale import str
import logging
from iguess_db_credentials import logFileName


def configLogging(logfile, loglevel):
    '''
    Set up the logging file
    '''

    format = "[%(asctime)s] %(levelname)s: %(message)s"
    logging.basicConfig(filename=logfile, level=loglevel, format=format)



# Configure logging
#configLogging(logFileName, "INFO")

argv = sys.argv[1:]

#logging.info("Processing command: " + " ".join(argv))

# Code modeled on http://stackoverflow.com/questions/7605631/passing-a-list-to-python-from-command-line
arg_dict = { } 

# Params (and the types) we expect  IMPORTANT: make sure each starts with a different letter!!!
switches = { 'url':str, 'procname':str, 'inputs':list, 'outnames':list, 'titles':list }

singles = '' . join([x[0] + ':' for x in switches])
long_form = [x + '=' for x in switches]

d = {}
for x in switches:
    d[x[0] + ':'] = '--' + x


try:            
    opts, args = getopt.getopt(argv, singles, long_form)
except getopt.GetoptError, e:          
 #   logging.error("Bad arg: " + e.msg)
    sys.exit(2)       

for opt, arg in opts:
    if opt[1] + ':' in d:       # opt -> :names
        o = d[opt[1] + ':'][2:]         # o -> names
    elif opt in d.values(): 
        o = opt[2:]
    else: o = ''

    if o and arg:
        if switches[o] == tuple or switches[o] == list or switches[o] == dict:
            arg_dict[o] = ast.literal_eval(arg)
        else:
            arg_dict[o] = arg

    if not o:
  #      logging.error("Invalid options!\n")
        sys.exit(2)
    #Error: bad arg for names... [dem] is not a <type 'list'>!

    if not isinstance(arg_dict[o], switches[o]):
   #     logging.error(str(opt) + " " + str(arg) + "\nError: bad arg for " + o + "... " + str(arg_dict[o]) + " is not a " + str(switches[o]) + "!")
        sys.exit(2)                 


# Now that we have our args sorted out, let's try to launch the WPSClient

iniCli = WPSClient.WPSClient()

# Basic test with literal inputs
#iniCli.init(
#    "http://services.iguess.tudor.lu/cgi-bin/pywps.cgi?", 
#    "test_rand_map", 
#    ["delay"], 
#    ["1"],
#    ["rand", "region", "num"])

# Test with a remote GML resource
#iniCli.init(
#    "http://services.iguess.tudor.lu/cgi-bin/pywps.cgi?", 
#    "buffer", 
#    ["size","data"], 
#    ["5","http://services.iguess.tudor.lu/pywps/sampleData/testLines4326.gml"],
#    ["buffer"])

# Test with a WFS resource
iniCli.init(
    # Process Server address
    arg_dict['url'] + '?', 
    # Process name
    arg_dict['procname'], 
    # Inputs
    arg_dict['inputs'],
    # Output names
    arg_dict['outnames'])

try:
    url = iniCli.sendRequest()
except Exception, e: # iniCli encountered an error
    sys.stdout.write("ERR:" + str(e))
    sys.exit()

# iniCli is happy!
#logging.info("Launching process: " + url)
sys.stdout.write("OK:" + url)  

# if(url == None):        # iniCli encountered an error
#     sys.stdout.write("ERR:" + iniCli.lastLogMessage)
# else:                   # iniCli is happy!
#     logging.info("Launching process: " + url + "\n")
#     sys.stdout.write("OK:" + url)     # This is the line that our rails code will be looking for!

# iniCli = None

# if(url == None):
#     print "Sorry something went wrong."

# else:
#     statCli = WPSClient.WPSClient()
    
#     statCli.initFromURL(url)

#     while not statCli.checkStatus():
#         print "Waiting..."
#         time.sleep(10)
    
#     # Needed because PyWPS deletes CRS information from the outputs
#     # Maybe it should be a parameter to the constructor?
#     statCli.epsg = "28992"
    
#     statCli.generateMapFile()
    
    
    
