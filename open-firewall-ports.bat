@echo off
echo ================================================
echo  MedIndia EHR - Opening Firewall Ports
echo ================================================
echo.
netsh advfirewall firewall delete rule name="MedIndia Client 5173" >nul 2>&1
netsh advfirewall firewall add rule name="MedIndia Client 5173" dir=in action=allow protocol=TCP localport=5173
echo Port 5173 done.
netsh advfirewall firewall delete rule name="MedIndia Server 5000" >nul 2>&1
netsh advfirewall firewall add rule name="MedIndia Server 5000" dir=in action=allow protocol=TCP localport=5000
echo Port 5000 done.
echo.
echo Open on your phone: http://10.205.178.139:5173
echo.
pause
