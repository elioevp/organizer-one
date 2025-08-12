import logging
import json
import os
import azure.functions as func
from azure.cosmos import CosmosClient, exceptions

# Leer la configuración de Cosmos DB desde las variables de entorno
try:
    ENDPOINT = os.environ['CosmosDbEndpoint']
    KEY = os.environ['CosmosDbKey']
    DATABASE_NAME = os.environ['CosmosDbDatabaseName']
    CONTAINER_NAME = os.environ['CosmosDbContainerName']
    logging.info(f"Cosmos DB config loaded: Endpoint={ENDPOINT}, Database={DATABASE_NAME}, Container={CONTAINER_NAME}")
except KeyError as e:
    logging.error(f"Error loading Cosmos DB environment variable: {e}. Ensure local.settings.json is configured correctly.")
    # Re-raise the exception or handle it to prevent the function from proceeding
    raise

def main(req: func.HttpRequest) -> func.HttpResponse:
    # --- INICIO DEL CÓDIGO TEMPORAL PARA TESTEO ---
    # Este bloque reemplaza toda la lógica original de tu función.
    
    try:
        ENDPOINT_VAL = os.environ.get('CosmosDbEndpoint', 'No configurado')
        KEY_VAL = os.environ.get('CosmosDbKey', 'No configurado')
        DATABASE_VAL = os.environ.get('CosmosDbDatabaseName', 'No configurado')
        CONTAINER_VAL = os.environ.get('CosmosDbContainerName', 'No configurado')
    except Exception as e:
        return func.HttpResponse(
            f"Error al leer variables de entorno: {e}",
            status_code=500
        )
    
    response_data = {
        "Endpoint": ENDPOINT_VAL,
        "Key": KEY_VAL[:10] + "..." if KEY_VAL != 'No configurado' and KEY_VAL is not None else KEY_VAL,
        "Database": DATABASE_VAL,
        "Container": CONTAINER_VAL
    }

    return func.HttpResponse(
        json.dumps(response_data, indent=2),
        mimetype="application/json",
        status_code=200
    )
    # --- FIN DEL CÓDIGO TEMPORAL PARA TESTEO ---