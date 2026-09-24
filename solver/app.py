import asyncio, os, secrets
from fastapi import FastAPI, Request, HTTPException
from optimizer import solve
app=FastAPI()
@app.get('/health')
def health(): return {'ok': True}
@app.post('/solve')
async def solve_route(request: Request):
    token=os.environ.get('SOLVER_TOKEN','')
    auth=request.headers.get('authorization','')
    if not token or not auth.startswith('Bearer ') or not secrets.compare_digest(auth[7:], token):
        raise HTTPException(status_code=401, detail='unauthorized')
    body=await request.body()
    if len(body)>65536: raise HTTPException(status_code=413, detail='too large')
    data=await request.json()
    try:
        return await asyncio.wait_for(asyncio.to_thread(solve, data.get('values')), timeout=8)
    except Exception:
        return {'status':'unavailable'}
