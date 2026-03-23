-- Drop the old overload that used int for preco/area params
DROP FUNCTION IF EXISTS count_imoveis(text, text, text[], numeric, numeric, int, int, int, numeric, numeric, text, text, text[], text, numeric, numeric, numeric, numeric);
DROP FUNCTION IF EXISTS count_imoveis(text, text, text[], int, int, int, int, int, int, int, text, text, text[], float, float, float, float);