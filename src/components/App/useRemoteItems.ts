// import { useEffect, useState } from 'react';

import { useDocSnapshot, useUpdateDocument } from "../../services/db/dbHooks";

/**
 * From:
 * https://wordwall.net/create/editcontent?guid=4a333f85ffc34f249c20e2342c9dc041&templateId=0
 * 
 * Run in console:
 * Array.from(document.querySelectorAll('.item-input.js-item-input span')).map(
    e => e.innerText).join("\n")
 */

export function useRemoteItems() {
  const remoteItems = useDocSnapshot('wheel-items', 'wheel-items') as { data: { items: string }} | null;
  console.log({ rawRI : remoteItems })
  return remoteItems?.data?.items || null;
}

export function updateRemoteItems(items: string) {
  return useUpdateDocument('wheel-items', 'wheel-items')({ items });
}
