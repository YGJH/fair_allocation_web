import math

def _validate(values):
    if not isinstance(values, list) or not values or not all(isinstance(r, list) for r in values):
        raise ValueError('matrix required')
    m=len(values[0])
    if m==0 or any(len(r)!=m for r in values):
        raise ValueError('rectangular matrix required')
    for r in values:
        for v in r:
            if not isinstance(v,(int,float)) or v<0 or not math.isfinite(v):
                raise ValueError('nonnegative finite values required')

def solve(values):
    _validate(values)
    n=len(values); m=len(values[0])
    if any(all(v==0 for v in row) for row in values):
        return {'status':'estimated','value':'0'}
    try:
        import numpy as np
        from scipy.optimize import minimize
        vals=np.array(values,dtype=float)
        x0=np.full((n,m),1.0/n).ravel()
        cons=[{'type':'eq','fun':lambda x,g=g: np.sum(x.reshape((n,m))[:,g])-1.0,
               'jac':lambda x,g=g: np.eye(n,m*n,k=g).reshape(n,m,n*m).sum(axis=0)[g] if False else np.array([1.0 if k % m == g else 0.0 for k in range(n*m)])} for g in range(m)]
        bounds=[(0.0,1.0)]*(n*m)
        def obj(x):
            u=(x.reshape((n,m))*vals).sum(axis=1)
            if np.any(u<=1e-12): return 1e100
            return -float(np.log(u).sum())
        def jac(x):
            X=x.reshape((n,m)); u=(X*vals).sum(axis=1)
            if np.any(u<=1e-12): return np.zeros(n*m)
            g=np.zeros((n,m))
            for i in range(n): g[i,:]=-vals[i,:]/u[i]
            return g.ravel()
        res=minimize(obj,x0,jac=jac,bounds=bounds,constraints=cons,method='SLSQP',options={'maxiter':300,'ftol':1e-9,'disp':False})
        if not res.success: return {'status':'unavailable'}
        X=res.x.reshape((n,m));
        if max(abs(X[:,g].sum()-1.0) for g in range(m))>1e-5: return {'status':'unavailable'}
        u=(X*vals).sum(axis=1)
        if any(v<=0 or not math.isfinite(float(v)) for v in u): return {'status':'unavailable'}
        prod=math.prod(float(v) for v in u)
        return {'status':'estimated','value':format(prod,'.12g')}
    except Exception:
        return {'status':'unavailable'}
