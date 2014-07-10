# coding: utf-8
'''
Copyright 2010 - 2014 CRP Henri Tudor

Licenced under the EUPL, Version 1.1 or – as soon they will be approved by the
European Commission - subsequent versions of the EUPL (the "Licence");
You may not use this work except in compliance with the Licence.
You may obtain a copy of the Licence at:

http://ec.europa.eu/idabc/eupl

Unless required by applicable law or agreed to in writing, software distributed
under the Licence is distributed on an "AS IS" basis, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the Licence for the
specific language governing permissions and limitations under the Licence.

Created on Nov 21, 2013

@author: desousa
'''

import sys
import time
import WPSClient

#url = "http://wps.iguess.tudor.lu/wpsoutputs/pywps-40332884-aaaf-11e3-8adb-005056a52e0d.xml"
url = "http://wps.iguess.tudor.lu/wpsoutputs/pywps-0a1e8c52-b59a-11e3-9302-005056a52e0d.xml"

outputs = {"slope":"MySlope","aspect":"MyAspect"}

statCli = WPSClient.WPSClient()

statCli.initFromURL(url, outputs)

status = False
while not status:
    try :
        status = statCli.checkStatus()
    except Exception, e:
        print "Something went wrong, please check the log file."
        print str(e)
        sys.exit()    
    print "Process still running"
    print str(statCli.getPercentCompleted()) + "% completed"
    print "Status message: " + str(statCli.getStatusMessage())
    time.sleep(10)
    
if(statCli.status == statCli.ERROR):
    print "There was an error, no map file was generated. Please check the log file."

else:
    # Needed because PyWPS deletes CRS information from the outputs
    # Maybe it should be a parameter to the constructor?
    statCli.epsg = "28992"
    path = None
    
    try :
        path = statCli.generateMapFile()
    except Exception, e:
        print "Something went wrong, please check the log file."
        print str(e)
        sys.exit()
    
    if (path is not None): 
        print "Wrote map file to disk:\n" + path
    else:
        print "No map file was written. Were complex outputs present?"