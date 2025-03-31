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
          console.log('User is admin via AuthProvider permissionLevel');
          setHasPermission(true);
          setIsChecking(false);
          return;
        }
        if (!isAuthorized || !user) {
          console.log('Not authorized or no user', { isAuthorized, user: !!user });
          setHasPermission(false);
          setIsChecking(false);
          return;
        }
        console.log('Checking permission for level:', requiredLevel, 'Current level:', permissionLevel);
        try {
                    const userEmail = user.email?.toLowerCase();
          const allowedIds = process.env.ALLOWED_DISCORD_IDS?.split(',') || [];
          if (userEmail && allowedIds.includes(user.provider_id || user.id || '')) {
            console.log('User ID is in ALLOWED_DISCORD_IDS from .env.local');
            setHasPermission(true);
            setIsChecking(false);
            return;
          }
          const permitted = await checkPermission(user, requiredLevel);
          console.log('Permission check result:', permitted);
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