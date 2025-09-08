'use client';

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { GUESTBOARD_CONTRACT } from '@/contracts/config';
import { type Address, isAddress } from 'viem';

export function SearchMessages() {
  const [addressToSearch, setAddressToSearch] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(true);

  const { data: userMessageIds } = useReadContract({
    ...GUESTBOARD_CONTRACT,
    functionName: 'userMsgId',
    // 只有当地址有效时，才将 string 转换为 Address 类型传入
    args: [isValidAddress ? addressToSearch as Address : undefined],
    query: {
      enabled: isValidAddress && !!addressToSearch,
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 无论是何种输入，都直接更新 state
    setAddressToSearch(value);
    
    // 校验逻辑保持不变，用于 UI 反馈和控制查询
    if (isAddress(value) || value === '') {
      setIsValidAddress(true);
    } else {
      setIsValidAddress(false);
    }
  };

  return (
    <section>
      <h2>Search Messages by Address</h2>
      <input
        type="text"
        placeholder="Enter address (0x...)"
        value={addressToSearch}
        onChange={handleInputChange}
        style={{ width: '400px', borderColor: isValidAddress ? 'initial' : 'red' }}
      />
      {!isValidAddress && addressToSearch !== '' && (
        <p style={{ color: 'red' }}>Invalid address format</p>
      )}
      
      {/* --- 从这里开始修改 --- */}
      {/* 修复: 使用 Array.isArray() 进行类型守卫。
        这会告诉 TypeScript，在这个代码块内部，userMessageIds 可以被安全地当作数组使用。
      */}
      {Array.isArray(userMessageIds) && userMessageIds.length > 0 && (
        <div>
          <h3>Messages from {addressToSearch}:</h3>
          <ul>
            {/* 我们还可以在 map 函数中为 id 添加 bigint 类型，以获得更好的类型提示。
              因为合约中的 uint256[] 会被 Viem 映射为 bigint[]。
            */}
            {userMessageIds.map((id: bigint) => (
              <li key={id.toString()}>Message ID: {id.toString()}</li>
            ))}
          </ul>
        </div>
      )}
       {/* --- 到这里结束修改 --- */}
    </section>
  );
}