import uuid
from datetime import datetime
from azure.data.tables import TableServiceClient
import os

TABLE_NAME = "VisitorLogs"

def log_visitor(name: str, email: str, user_agent: str):
    conn_str = os.getenv("storage-connection-string")
    if not conn_str:
        raise RuntimeError("Storage connection string not configured")

    service = TableServiceClient.from_connection_string(conn_str)
    table = service.get_table_client(TABLE_NAME)

    entity = {
        "PartitionKey": "gateway",
        "RowKey": str(uuid.uuid4()),
        "name": name,
        "email": email,
        "visited_at": datetime.utcnow().isoformat(),
        "user_agent": user_agent
    }

    table.create_entity(entity)
