import { useAuth } from '../components/AuthProvider';
import { hasPermission as checkPermission, PermissionLevel } from '../lib/discord';
import { useState, useEffect } from 'react';

export function usePermission(requiredLevel: PermissionLevel = 'viewer') {
  const { user, isAuthorized } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const checkUserPermission = async () => {
      if (!isAuthorized || !user) {
        setHasPermission(false);
        setIsChecking(false);
        return;
      }

      try {
        const permitted = await checkPermission(user, requiredLevel);
        setHasPermission(permitted);
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasPermission(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkUserPermission();
  }, [user, isAuthorized, requiredLevel]);

  return { hasPermission, isChecking };
}