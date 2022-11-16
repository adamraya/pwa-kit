/*
 * Copyright (c) 2022, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {QueryClient} from '@tanstack/react-query'
import {ApiClients, Argument, DataType} from './types'
import {ShopperCustomersMutationType} from './ShopperCustomers'

const isObject = (item: null) => typeof item === 'object' && !Array.isArray(item) && item !== null

export interface QueryKeysMatrixElement {
    update?: Array<Array<string | unknown>>
    invalidate?: Array<Array<string | unknown>>
    remove?: Array<Array<string | unknown>>
}

type QueryKeysMatrix = {
    [key in ShopperCustomersMutationType]: (param: any, response: any) => QueryKeysMatrixElement
}

// TODO: Make Client dynamic
type Client = ApiClients['shopperCustomers']

export const updateCache = <Action extends ShopperCustomersMutationType>(
    queryClient: QueryClient,
    action: Action,
    queryKeysMatrix: QueryKeysMatrix,
    response: DataType<Client[Action]>,
    params: Argument<Client[Action]>
) => {
    const isMatchingKey = (cacheQuery: {queryKey: {[x: string]: any}}, queryKey: any[]) =>
        queryKey.every((item, index) =>
            isObject(item) && isObject(cacheQuery.queryKey[index])
                ? Object.entries(cacheQuery.queryKey[index])
                      .sort()
                      .toString() ===
                  Object.entries(item)
                      .sort()
                      .toString()
                : item === cacheQuery.queryKey[index]
        )

    // STEP 1. Update data inside query cache for the matching queryKeys
    queryKeysMatrix[action](params, response)?.update?.map((queryKey: any) => {
        queryClient.setQueryData(queryKey, response)
    })

    // STEP 2. Invalidate cache entries with the matching queryKeys
    queryKeysMatrix[action](params, response)?.invalidate?.map((queryKey: any) => {
        queryClient.invalidateQueries({
            predicate: (cacheQuery: any) => isMatchingKey(cacheQuery, queryKey)
        })
    })

    // STEP 3. Remove cache entries with the matching queryKeys
    queryKeysMatrix[action](params, response)?.remove?.map((queryKey: any) => {
        queryClient.removeQueries({
            predicate: (cacheQuery: any) => isMatchingKey(cacheQuery, queryKey)
        })
    })
}