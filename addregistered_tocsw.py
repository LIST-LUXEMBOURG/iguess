#!/usr/bin/python

import sys

scriptname, a, b = sys.argv

if len(sys.argv) != 3:
    raise Exception("Script requires 2 args: dataset_url and dataset_identifier")

def verifico_ricezione_variabili(a, b):
    with open('/home/matteo/dev/tudor/iguess/ricezione.txt', 'a') as f:
        f.write(str(a) + " " + str(b)+ " " + "\n")
        
verifico_ricezione_variabili(a, b)



