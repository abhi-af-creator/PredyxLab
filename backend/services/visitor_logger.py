@app.post("/visitor-log")
async def visitor_log(payload: VisitorPayload, request: Request):
    try:
        conn_str = os.getenv("STORAGE_CONNECTION_STRING")
        logger.warning(f"ENV CHECK STORAGE_CONNECTION_STRING = {bool(conn_str)}")

        if not conn_str:
            logger.warning("Storage connection string not configured")
            return {"status": "skipped"}

        # Lazy import (keeps startup clean)
        from azure.data.tables import TableServiceClient

        service = TableServiceClient.from_connection_string(conn_str)
        table = service.get_table_client("VisitorLogs")

        source = payload.interest or "launch_app"

        entity = {
            "PartitionKey": source,          # ✅ DISTINGUISHES SOURCE
            "RowKey": str(uuid.uuid4()),
            "name": payload.name,
            "email": payload.email,
            "interest": source,
            "visited_at": datetime.utcnow().isoformat(),
            "user_agent": request.headers.get("user-agent", ""),
        }

        table.create_entity(entity)

        return {"status": "logged"}

    except Exception as e:
        logger.warning(f"Visitor logging failed: {e}")
        return {"status": "skipped"}
