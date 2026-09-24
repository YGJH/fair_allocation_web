import os
from fastapi.testclient import TestClient
from optimizer import solve
from app import app

def test_disjoint_interests():
    result = solve([[3, 0], [0, 2]])
    assert result['status'] == 'estimated'
    assert abs(float(result['value']) - 6.0) < 1e-5

def test_zero_attainable_nsw():
    assert solve([[0, 0], [1, 1]]) == {'status':'estimated','value':'0'}

def test_single_item_fractional():
    result=solve([[1],[1]])
    assert result['status']=='estimated'
    assert abs(float(result['value'])-0.25)<1e-5

def test_invalid_matrix():
    try: solve([[1],[]]); assert False
    except ValueError: pass

def test_app_auth_and_health(monkeypatch):
    monkeypatch.setenv('SOLVER_TOKEN','secret')
    c=TestClient(app)
    assert c.get('/health').status_code==200
    assert c.post('/solve',json={'values':[[1]]}).status_code==401
    assert c.post('/solve',json={'values':[[1]]},headers={'authorization':'Bearer secret'}).status_code==200
