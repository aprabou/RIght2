import { useState, useCallback } from 'react';
import { connectionsStorage } from '../utils/connectionsStorage';
import { clearMatchCache } from '../utils/connectionMatcher';

/**
 * Custom hook for managing LinkedIn connections
 * 
 * @returns Connection management state and methods
 */
export const useConnections = () => {
  const [hasConnections, setHasConnections] = useState(
    connectionsStorage.hasConnections()
  );
  const [connectionCount, setConnectionCount] = useState(
    connectionsStorage.getConnections().length
  );

  /**
   * Handle successful connection upload
   */
  const handleUploadSuccess = useCallback((count: number) => {
    clearMatchCache();
    setHasConnections(true);
    setConnectionCount(count);
  }, []);

  /**
   * Delete all connections
   */
  const handleDeleteConnections = useCallback((): boolean => {
    if (
      window.confirm(
        'Are you sure you want to delete all your imported connections? This cannot be undone.'
      )
    ) {
      connectionsStorage.deleteAll();
      clearMatchCache();
      setHasConnections(false);
      setConnectionCount(0);
      return true;
    }
    return false;
  }, []);

  /**
   * Refresh connection count
   */
  const refreshConnectionCount = useCallback(() => {
    setConnectionCount(connectionsStorage.getConnections().length);
    setHasConnections(connectionsStorage.hasConnections());
  }, []);

  /**
   * Get connection metadata
   */
  const getMetadata = useCallback(() => {
    return connectionsStorage.getMetadata();
  }, []);

  return {
    hasConnections,
    connectionCount,
    handleUploadSuccess,
    handleDeleteConnections,
    refreshConnectionCount,
    getMetadata,
  };
};
