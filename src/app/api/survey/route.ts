import { getSurveyResults, recordSurveyResponse } from '../../../server/repository';
import { apiError, HttpError, isUuid, json, readBody } from '../../../server/http';
import { enforceLimit } from '../../../server/limits';

export async function GET(request: Request) {
  try {
    const sessionId = new URL(request.url).searchParams.get('sessionId');
    if (!sessionId) throw new HttpError(400, 'sessionId is required');
    if (!isUuid(sessionId)) throw new HttpError(400, 'invalid sessionId');
    return json(await getSurveyResults(sessionId));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    const sessionId = String(body.sessionId ?? '');
    const allocationId = String(body.allocationId ?? '');
    if (!isUuid(sessionId) || !isUuid(allocationId)) throw new HttpError(400, 'invalid survey response');
    if (typeof body.verdict !== 'boolean') throw new HttpError(400, 'verdict must be boolean');
    await enforceLimit('survey', request);
    return json(await recordSurveyResponse(sessionId, allocationId, body.verdict), 201);
  } catch (error) {
    return apiError(error);
  }
}
