import { useState, useEffect, useCallback } from "react";
import { getAssets, updateAsset, deleteAsset, normalizeAsset } from "../api/assets";
import { MOCK_CONTENTS } from "../constants/mockData";

const LS_KEY = "interx_contents_v3";

function loadFallback() {
  try {
    const r = localStorage.getItem(LS_KEY);
    return r ? JSON.parse(r) : MOCK_CONTENTS;
  } catch { return MOCK_CONTENTS; }
}
function saveFallback(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
}

export function useAssets(params = {}) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAssets(params);
      const normalized = data.map(normalizeAsset);
      setAssets(normalized);
      saveFallback(normalized);
    } catch (err) {
      // 백엔드 미연결 시 localStorage fallback
      console.warn("[useAssets] API 실패, fallback 사용:", err.message);
      setAssets(loadFallback());
      setError(null); // fallback이므로 에러 숨김
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  const update = useCallback(async (id, payload) => {
    try {
      await updateAsset(id, payload);
      // 로컬 상태 즉시 반영
      setAssets(prev => prev.map(a =>
        a.id === id ? { ...a, ...normalizeAsset({ ...a, ...payload }) } : a
      ));
      // fallback 저장도 갱신
      setAssets(prev => { saveFallback(prev); return prev; });
    } catch {
      // 백엔드 미연결 시 로컬만 업데이트
      setAssets(prev => {
        const next = prev.map(a => a.id === id ? { ...a, ...payload } : a);
        saveFallback(next);
        return next;
      });
    }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      await deleteAsset(id);
    } catch {
      console.warn("[useAssets] DELETE API 실패, 로컬만 삭제");
    }
    setAssets(prev => {
      const next = prev.filter(a => a.id !== id);
      saveFallback(next);
      return next;
    });
  }, []);

  return { assets, loading, error, refetch: fetch, update, remove };
}
