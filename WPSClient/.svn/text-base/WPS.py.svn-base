import os, sys, shutil, urllib2, urlparse
import random
from array import array
from ConfigParser import SafeConfigParser

resultsComplex = []
resultsLiteral = []

###########################################################

class LiteralOutput:

	name = None
	value = None

	def __init__(self, rawString):

		self.name = rawString.split("<ows:Identifier>")[1].split("</ows:Identifier>")[0]
		self.value = rawString.split("<wps:LiteralData")[1].split(">")[1].split("</wps:LiteralData>")[0].split("</wps:LiteralData")[0] 

###########################################################

class ComplexOutput:

	name = None
	value = None
	uniqueID = None

	def __init__(self, rawString, unique):

		self.name = rawString.split("<ows:Identifier>")[1].split("</ows:Identifier>")[0]
		self.value = rawString.split("<wps:ComplexData")[1].split(">")[1].split("</wps:ComplexData>")[0].split("</wps:ComplexData")[0]
		self.uniqueID = unique

	def saveToDisk(self):
		print "Not ready yet"

###########################################################

def loadConfigs():

	parser = SafeConfigParser()
	parser.read('default.cfg')

	print "MapServer: " + parser.get('MapServer', 'MapServerURL')
	print "mapFilesPath: " + parser.get('MapServer', 'mapFilesPath')
	print "mapTemplate: " + parser.get('MapServer', 'mapTemplate')
	print "imagePath: " + parser.get('MapServer', 'imagePath')
	print "imgeURL: " + parser.get('MapServer', 'imgeURL')
	print "additionalProjs: " + parser.get('MapServer', 'additionalProjs')

	
###########################################################

def splitOutputs2(outputs):

	outVector = outputs.split("<wps:Output>")
	for o in outVector:
		if o.count("wps:LiteralData") > 0:
			resultsLiteral.append(LiteralOutput(o))
		elif o.count("wps:ComplexData") > 0:
			resultsComplex.append(ComplexOutput(o, str(random.randint(0, 999999))))



###########################################################

def splitOutputs(outputs):

	tempComplex = []
	tempLiteral = []

	compData = outputs.split("<wps:ComplexData>")
	compData.remove(compData[0])

	for r in compData:
		print "r: " + r
		x = r.split("<wps:LiteralData>")
		print "x: " + str(x)
		print "len: " + str(len(x))
		for i in range(1, len(x)):
			print "In the cycle"
			tempLiteral.append(x[i])
		tempComplex.append(x[0])

	print " --- Complex outputs"
	for c in tempComplex:
		x = c.split("</wps:ComplexData>")
		print x
		resultsComplex.append(x[0])

	print " ---- Literal outputs:"
	for l in tempLiteral:
		x = l.split("</wps:LiteralData>")
		print x
		resultsLiteral.append(x[0])

###########################################################

def saveOutputsGML(dest, fileName):

	i = 1
	for out in resultsComplex:

		try:
			fileName = os.path.join(dest, fileName + "_" + str(i) + ".gml")
			with open(fileName, 'wb') as f:
				f.write(out)

		finally:
			f.close()

		print "Saved in %s" %fileName
		i = i + 1;

###########################################################


def download(url, dest, fileName=None):

#based on: 

#http://stackoverflow.com/questions/862173/how-to-download-a-file-using-python-in-a-smarter-way/863017#863017

    print "Start downloading of %s" %url

    r = urllib2.urlopen(urllib2.Request(url))

    print "--------------------------"
    res = splitOutputs(r.read())
    saveOutputsGML(dest, fileName, res)
    print "--------------------------"

    try:

        fileName = os.path.join(dest, fileName)

        with open(fileName, 'wb') as f:

            shutil.copyfileobj(r,f)

        print "Saved in %s" %fileName

    finally:

        r.close()



for i in range(1,2):
	print "This is a test: " + str(i) + "\n"


print "\n\n################"
## Test the ConfigParser
loadConfigs()

## Test the split function
print "\n\n################"
s = "IIIII<wps:ComplexData>AA</wps:ComplexData>XX<wps:ComplexData>BB</wps:ComplexData>XX<wps:LiteralData>aa</wps:LiteralData>XX<wps:ComplexData>CC</wps:ComplexData>FFFFFFF"
splitOutputs(s)
print " --- Complex outputs"
for c in resultsComplex:
	print c
print " ---- Literal outputs:"
for l in resultsLiteral:
	print l
print "################"

#wfsfile = "test2"
#path2save2 = ""
#wfsurl = "http://iguess.tudor.lu/cgi-bin/pywps.cgi?&REQUEST=Execute&IDENTIFIER=ogrbuffer&SERVICE=WPS&VERSION=1.0.0&DATAINPUTS=size=1;data=http%3A%2F%2Figuess.tudor.lu%2Fpywps%2FsampleData%2FsampleLineRotterdam.xml"
#download(wfsurl,path2save2 ,wfsfile)



## Test the second split function
resultsComplex = []
resultsLiteral = []
print "\n\n################"
print "Testing second split function"
out = "<wps:Output><ows:Identifier>file1</ows:Identifier><ows:Title>Output literal data</ows:Title><wps:Data><wps:ComplexData>AA</wps:ComplexData>></wps:Data></wps:Output><wps:Output><ows:Identifier>result</ows:Identifier><ows:Title>Output literal data</ows:Title><wps:Data><wps:LiteralData dataType=\"integer\">3</wps:LiteralData></wps:Data></wps:Output><wps:Output><ows:Identifier>file2</ows:Identifier><ows:Title>Output literal data</ows:Title><wps:Data><wps:ComplexData>BB</wps:ComplexData>></wps:Data></wps:Output>"
splitOutputs2(out)
for c in resultsComplex:
	print c.name
	print c.value
for l in resultsLiteral:
	print l.name
	print l.value



















