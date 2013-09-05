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

Created on Sep 26, 2012

@author: Luis de Sousa [luis.desousa@tudor.lu]

Contains the WPS XML tags needed to parse the outputs of a WPS process. 
'''

###########################################################

class Tags:
    
    preRef  = "<wps:Reference"
    midRef  = "wps:Reference href=\""
    preId   = "<ows:Identifier>"
    sufId   = "</ows:Identifier>"
    preLit  = "<wps:LiteralData>"
    sufLit  = "</wps:LiteralData>"
    preCplx = "<wps:ComplexData"
    sufCplx = "</wps:ComplexData>"
    preAck  = "<wps:ProcessAccepted>"
    preFail = "<wps:ProcessFailed>"
    sufFail = "</wps:ProcessFailed>"
    preSucc = "<wps:ProcessSucceeded>"
    preOut  = "<wps:Output>"
    prStart = "</wps:ProcessStarted>"
