@echo off
echo Setting up Auth Database...
echo.

"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d auth_db -f setup-auth-db.sql

echo.
echo Auth database setup complete!
echo.
pause
