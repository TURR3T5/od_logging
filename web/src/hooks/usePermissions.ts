import { useAuth } from '../components/AuthProvider';
import { hasPermission as checkPermission, PermissionLevel } from '../lib/discord';
import { useState, useEffect } from 'react';
export function usePermission(requiredLevel: PermissionLevel = 'viewer') {
    const { user, isAuthorized, permissionLevel } = useAuth();
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState<boolean>(true);
    useEffect(() => {
      const checkUserPermission = async () => {
                if (permissionLevel === 'admin') {
          setHasPermission(true);
          setIsChecking(false);
          return;
        }
        if (!isAuthorized || !user) {
          setHasPermission(false);
          setIsChecking(false);
          return;
        }
        try {
                    const userEmail = user.email?.toLowerCase();
          const allowedIds = process.env.ALLOWED_DISCORD_IDS?.split(',') || [];
          if (userEmail && allowedIds.includes(user.provider_id || user.id || '')) {
            setHasPermission(true);
            setIsChecking(false);
            return;
          }
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
    }, [user, isAuthorized, requiredLevel, permissionLevel]);
    return { hasPermission, isChecking };
  }