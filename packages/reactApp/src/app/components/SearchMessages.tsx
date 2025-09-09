'use client';

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { GUESTBOARD_CONTRACT } from '@/contracts/config';
import { type Address, isAddress } from 'viem';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

export function SearchMessages() {
  const [addressToSearch, setAddressToSearch] = useState('');
  // New state to trigger the search only on button click
  const [searchedAddress, setSearchedAddress] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(true);

  const { data: userMessageIds, refetch } = useReadContract({
    ...GUESTBOARD_CONTRACT,
    functionName: 'getMessageIdsByUser',
    args: [searchedAddress as Address],
    query: {
      // The query is enabled only when a valid address has been submitted for search
      enabled: isAddress(searchedAddress),
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddressToSearch(value);
    // Validate on input change for instant feedback
    setIsValidAddress(isAddress(value) || value === '');
  };

  const handleSearch = () => {
    if (isValidAddress && addressToSearch) {
        setSearchedAddress(addressToSearch);
    } else {
        // Clear previous results if the new address is invalid or empty
        setSearchedAddress('');
    }
  };

  const handleClear = () => {
    setAddressToSearch('');
    setSearchedAddress('');
    setIsValidAddress(true);
  };

  return (
        <div className="space-y-4">
          <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter address (0x...)"
              value={addressToSearch}
              onChange={handleInputChange}
              className={!isValidAddress && addressToSearch !== '' ? 'border-destructive' : ''}
            />
          </div>
          <div className="flex gap-2">
              <Button onClick={handleSearch} variant="outline" className="flex-1 bg-transparent">
              Search
              </Button>
              <Button onClick={handleClear} variant="ghost">
              Clear
            </Button>
            </div>

          {!isValidAddress && addressToSearch !== '' && (
            <p className="text-sm text-destructive">Invalid address format</p>
          )}
          
          {isAddress(searchedAddress) && Array.isArray(userMessageIds) && (
            <div>
              {userMessageIds.length > 0 ? (
                <>
                  <h3 className="text-sm font-medium">Messages from {searchedAddress}:</h3>
                  <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
                    {userMessageIds.map((id: bigint) => (
                      <li key={id.toString()}>Message ID: {id.toString()}</li>
                    ))}
                  </ul>
                </>
              ) : (
                 <p className="text-sm text-muted-foreground text-center pt-2">No messages found for this address.</p>
              )}
            </div>
          )}
        </div>
  );
}