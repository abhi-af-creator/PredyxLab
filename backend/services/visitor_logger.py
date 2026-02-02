from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional
import os, uuid
from datetime import datetime
from azure.data.tables import TableServiceClient

router = APIRouter()

class VisitorPayload(BaseModel):
    name: str
    email: str
    interest: Optional[str] = "launch_app"

@router.post("/visitor-log")
async def visitor_log(payload: VisitorPayload, request: Request):
    try:
        conn_str = os.getenv("storageconnectionstring")
        if not conn_str:
            return {"status": "skipped"}

        service = TableServiceClient.from_connection_string(conn_str)
        table = service.get_table_client("VisitorLogs")

        entity = {
            "PartitionKey": payload.interest,  # ✅ THIS IS THE FIX
            "RowKey": str(uuid.uuid4()),
            "name": payload.name,
            "email": payload.email,
            "interest": payload.interest,
            "visited_at": datetime.utcnow().isoformat(),
            "user_agent": request.headers.get("user-agent", "")
        }

        table.create_entity(entity)
        return {"status": "logged"}

    except Exception as e:
        return {"status": "skipped", "reason": str(e)}
