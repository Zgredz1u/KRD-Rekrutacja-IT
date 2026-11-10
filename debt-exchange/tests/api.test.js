import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  getDebtsCount,
  getFilteredDebts,
  getTopDebts,
  isPhraseValid,
  MIN_PHRASE_LENGTH,
} from '../src/api/debts';

const BASE = 'https://rekrutacja-webhosting-it.krd.pl/api/Recruitment';

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('isPhraseValid', () => {
  it('rejects phrases shorter than 3 characters', () => {
    expect(isPhraseValid('')).toBe(false);
    expect(isPhraseValid('a')).toBe(false);
    expect(isPhraseValid('ab')).toBe(false);
    expect(isPhraseValid('   ')).toBe(false);
  });

  it('accepts phrases of 3 characters or more', () => {
    expect(isPhraseValid('abc')).toBe(true);
    expect(isPhraseValid('  abc  ')).toBe(true);
  });

  it('exposes the minimum length constant', () => {
    expect(MIN_PHRASE_LENGTH).toBe(3);
  });
});

describe('getTopDebts', () => {
  it('GETs the GetTopDebts endpoint and parses the array', async () => {
    const data = [{ Id: 1, Name: 'X' }];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, data));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getTopDebts();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE}/GetTopDebts`);
    expect(options.method).toBe('GET');
    expect(result).toEqual(data);
  });

  it('throws ApiError with the status on failure', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(500, 'boom'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getTopDebts()).rejects.toMatchObject({ name: 'ApiError', status: 500 });
  });
});

describe('getFilteredDebts', () => {
  it('POSTs a JSON body with the phrase', async () => {
    const data = [{ Id: 2, Name: 'Y' }];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, data));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getFilteredDebts('marcin');

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE}/GetFilteredDebts`);
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual({ phrase: 'marcin' });
    expect(result).toEqual(data);
  });

  it('surfaces HTTP 405 as an ApiError (short phrase)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(405, ''));
    vi.stubGlobal('fetch', fetchMock);

    const promise = getFilteredDebts('ab');
    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({ status: 405 });
  });
});

describe('getDebtsCount', () => {
  it('GETs the GetDebtsCount endpoint and returns a number', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, 666));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getDebtsCount();

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE}/GetDebtsCount`);
    expect(options.method).toBe('GET');
    expect(result).toBe(666);
  });
});
