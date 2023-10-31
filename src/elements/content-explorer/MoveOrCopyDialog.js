/**
 * @flow
 * @file Move or Copy Dialog
 * @author Trung Tran
 */

import React, { useState, useEffect } from 'react';
import { injectIntl, IntlShape } from 'react-intl';
import messages from '../common/messages';
import {
    HTTP_STATUS_CODE_NOT_MODIFED,
    HTTP_STATUS_CODE_BAD_REQUEST,
    HTTP_STATUS_CODE_FORBIDDEN,
    HTTP_STATUS_CODE_NOT_FOUND,
    HTTP_STATUS_CODE_CONFLICT,
    HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR,
} from '../../constants';
import type { BoxItem, Collection } from '../../common/types/core';
import { ContentExplorerModalContainer } from '../../features/content-explorer';
import API from '../../api';

type Props = {
    api: API,
    currentCollection: Collection,
    currentFolderId: string,
    intl: IntlShape,
    item: BoxItem,
    onCancel: Function,
};

const MoveOrCopyDialog = ({ currentCollection, currentFolderId, onCancel, item, intl, api }: Props) => {
    const INITIAL_FOLDERS_PATH = [
        {
            id: '0',
            name: 'All Files',
        },
    ];

    const [items, setItems] = useState([]);
    const [rootFolder, setRoot] = useState(currentFolderId);
    const [messageError, setmessageError] = useState();
    const [errorCode, seterrorCode] = useState();
    const [isMoveButtonLoading, setIsMoveButtonLoading] = useState(true);
    const [isCopyButtonLoading, setIsCopyButtonLoading] = useState(true);
    // có thể xoá
    const [dataState, setDataState] = useState({
        folderId: '0',
        foldersPath: INITIAL_FOLDERS_PATH,
    });
    const [loadingDataState, setLoadingDataState] = useState(true);

    useEffect(() => {
        const breadcrumbs = (currentCollection.breadcrumbs || []).concat({
            id: currentCollection.id,
            name: currentCollection.name,
        });

        setDataState({
            ...dataState,
            foldersPath: breadcrumbs,
        });
    }, [currentCollection.breadcrumbs]);

    // init
    useEffect(() => {
        fetchFolder();
    }, [rootFolder]);

    useEffect(() => {
        console.log('loadingDataState', loadingDataState);
    }, [loadingDataState]);

    // update message
    useEffect(() => {}, [errorCode]);

    const fetchFolder = async (): void => {
        setLoadingDataState(true);
        await api.getFolderAPI().getFolder(
            rootFolder,
            1000,
            0,
            'name',
            'ASC',
            (collection: Collection) => {
                const ITEMS = [];
                collection.items.forEach(element => {
                    if (element.type === 'folder') {
                        ITEMS.push({
                            id: element.id,
                            name: element.name,
                            type: element.type,
                            hasCollaborations: element.has_collaborations,
                            isActionDisabled: false,
                        });
                    }
                });

                setItems(ITEMS);
                setIsMoveButtonLoading(false);
                setIsCopyButtonLoading(false);
            },
            (error: ElementsXhrError, code: string) => {
                console.error(error, code);
            },
            { forceFetch: true },
        );

        setLoadingDataState(false);
    };

    const successCallback = (): void => {
        closeModal();
        setIsMoveButtonLoading(false);
        setIsCopyButtonLoading(false);
    };

    const errorMoveOrCopyCallback = (error: ElementsXhrError): void => {
        seterrorCode(error.status);
        setIsMoveButtonLoading(false);
        setIsCopyButtonLoading(false);
        switch (error.status) {
            case HTTP_STATUS_CODE_NOT_MODIFED:
                setmessageError(intl.formatMessage(messages.error));
                break;
            case HTTP_STATUS_CODE_BAD_REQUEST: // ラーが発生しました
                setmessageError(intl.formatMessage(messages.moveOrCopyBadRequest));
                break;
            case HTTP_STATUS_CODE_FORBIDDEN:
                setmessageError(intl.formatMessage(messages.error));
                break;
            case HTTP_STATUS_CODE_NOT_FOUND:
                setmessageError(intl.formatMessage(messages.error));
                break;
            case HTTP_STATUS_CODE_CONFLICT:
                setmessageError(intl.formatMessage(messages.moveOrCopyDialogErrorInUse));
                break;
            case HTTP_STATUS_CODE_INTERNAL_SERVER_ERROR:
                setmessageError(intl.formatMessage(messages.error));
                break;
            default:
                setmessageError(intl.formatMessage(messages.error));
        }
    };

    const closeModal = () => {
        onCancel();
    };

    const handleCreateFolderSubmit = folderName => {
        const { folderId: currentFolderId, foldersPath } = state;

        // Add folder to list of items
        const folderId = `${Date.now()}`;
        const newFolder = {
            id: folderId,
            name: folderName,
            type: 'folder',
        };
        items[currentFolderId] = items[currentFolderId] || [];
        items[currentFolderId].push(newFolder);

        // Drill into that folder
        setDataState({
            folderId,
            foldersPath: foldersPath.concat([newFolder]),
        });
    };

    const handleEnterFolder = enteredFolder => {
        setRoot(enteredFolder.id);
    };

    const handleMoveItem = destFolder => {
        setIsMoveButtonLoading(true);
        setmessageError();
        if (item.type === 'folder') {
            api.getFolderAPI().move(item.id, destFolder.id, successCallback, errorMoveOrCopyCallback);
        } else {
            api.getFileAPI().move(item.id, destFolder.id, successCallback, errorMoveOrCopyCallback);
        }
    };

    const handleCopyItem = destFolder => {
        setIsCopyButtonLoading(true);
        setmessageError();
        if (item.type === 'folder') {
            api.getFolderAPI().copy(item.id, destFolder.id, successCallback, errorMoveOrCopyCallback);
        } else {
            api.getFileAPI().copy(item.id, destFolder.id, successCallback, errorMoveOrCopyCallback);
        }
    };

    const handleSearchSubmit = () => {
        setDataState({
            ...dataState,
            folderId: 'search',
        });
    };

    const handleExitSearch = ({ id }) => {
        setDataState({
            ...dataState,
            folderId: id,
        });
    };

    const { foldersPath } = dataState;
    const childItems = items || [];
    const shouldNotUsePortal = true;

    return (
        <ContentExplorerModalContainer
            modalTitle={intl.formatMessage(messages.moveOrCopyDialogLabel, { name: item.name })}
            modalDescription={intl.formatMessage(messages.moveOrCopyDialogDescription)}
            modalError={messageError}
            onRequestClose={onCancel}
            onCreateFolderSubmit={handleCreateFolderSubmit}
            contentExplorerMode="moveCopy"
            initialFoldersPath={foldersPath}
            onEnterFolder={handleEnterFolder}
            onMoveItem={handleMoveItem}
            onCopyItem={handleCopyItem}
            onSearchSubmit={handleSearchSubmit}
            onExitSearch={handleExitSearch}
            items={childItems}
            numItemsPerPage={1000}
            numTotalItems={childItems.length}
            onLoadMoreItems={() => {}}
            showCreateNewFolderButton={false}
            isCopyButtonLoading={isCopyButtonLoading}
            isMoveButtonLoading={isMoveButtonLoading}
            shouldNotUsePortal={shouldNotUsePortal}
        />
    );
};

export default injectIntl(MoveOrCopyDialog);
