# Small helper class that keeps track of which browser tabs are "listening"
# to which document. When the fake pipeline moves to the next stage we
# just loop over the connections for that document and send them a message.

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # doc_id -> list of open websocket connections
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, doc_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(doc_id, []).append(websocket)

    def disconnect(self, doc_id: str, websocket: WebSocket):
        connections = self.active_connections.get(doc_id, [])
        if websocket in connections:
            connections.remove(websocket)
        if not connections and doc_id in self.active_connections:
            del self.active_connections[doc_id]

    async def broadcast(self, doc_id: str, message: dict):
        # send the update to every tab currently watching this document
        for connection in list(self.active_connections.get(doc_id, [])):
            try:
                await connection.send_json(message)
            except Exception:
                # connection probably closed already, just skip it
                self.disconnect(doc_id, connection)


# One shared instance used everywhere in the app
manager = ConnectionManager()
