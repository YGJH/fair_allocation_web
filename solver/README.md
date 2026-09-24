# Solver

Private FastAPI service. Set `SOLVER_TOKEN`; call `POST /solve` with a bearer token. It has no database credentials. Deploy with CPU/memory limits and a reverse request timeout; failures return `unavailable`.
