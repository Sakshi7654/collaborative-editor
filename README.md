## Architecture

CodeMate follows a **client-server architecture** where the React frontend handles the UI and code editor, while the Node.js backend manages real-time communication using Socket.IO.

```text
                         CodeMate
                            │
             ┌──────────────┴──────────────┐
             │                             │
        Frontend                       Backend
        (Client)                       (Server)
             │                             │
     React + CodeMirror              Node.js + Express
             │                             │
     Socket.IO Client  ◄──────────►  Socket.IO Server
             │                             │
             │                         Room Manager
             │                             │
             └──────── Real-Time Code ─────┘
                    Synchronization

