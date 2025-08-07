// src/hooks/useUserData.js
import { useState, useEffect, useCallback } from 'react';
import userDataManager from '../utils/UserDataManager';

export const useUserData = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = userDataManager.addObserver((data, loading) => {
      setUserData(data);
      setIsLoading(loading);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (username, password) => {
    return await userDataManager.login(username, password);
  }, []);

  const logout = useCallback(() => {
    userDataManager.logout();
  }, []);

  const refreshData = useCallback(async () => {
    if (userDataManager.getToken()) {
      await userDataManager.fetchAllUserData();
    }
  }, []);

  return {
    userData,
    isLoading,
    isLoggedIn: userDataManager.isLoggedIn(),
    login,
    logout,
    refreshData,
    // 便捷访问方法
    user: userData?.user,
    createdEvents: userData?.createdEvents,
    registeredEvents: userData?.registeredEvents,
    reviews: userData?.reviews,
    stats: userData?.stats,
    // 操作方法
    updateProfile: userDataManager.updateProfile,
    addReview: userDataManager.addReview,
    registerEvent: userDataManager.registerEvent,
    createEvent: userDataManager.createEvent
  };
};