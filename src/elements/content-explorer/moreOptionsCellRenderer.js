/**
 * @flow
 * @file Function to render the date table cell
 * @author Box
 */

import React from 'react';
import MoreOptions from './MoreOptions';
import type { BoxItem } from '../../common/types/core';

export default (
    canPreview: boolean,
    canShare: boolean,
    canMoveOrCopy: boolean,
    canDownload: boolean,
    canDelete: boolean,
    canRename: boolean,
    onItemSelect: Function,
    onItemDelete: Function,
    onItemDownload: Function,
    onItemRename: Function,
    onItemShare: Function,
    onItemMoveOrCopy: Function,
    onItemPreview: Function,
    isSmall: boolean,
) => ({ rowData }: { rowData: BoxItem }) => (
    <MoreOptions
        canPreview={canPreview}
        canShare={canShare}
        canMoveOrCopy={canMoveOrCopy}
        canDownload={canDownload}
        canDelete={canDelete}
        canRename={canRename}
        onItemSelect={onItemSelect}
        onItemDelete={onItemDelete}
        onItemDownload={onItemDownload}
        onItemRename={onItemRename}
        onItemShare={onItemShare}
        onItemMoveOrCopy={onItemMoveOrCopy}
        onItemPreview={onItemPreview}
        isSmall={isSmall}
        item={rowData}
    />
);
