/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import nock from 'nock'
import {mockQueryEndpoint, renderHookWithProviders, waitAndExpectSuccess} from '../test-utils'
import {useCustomQuery} from './useQuery'

jest.mock('../auth/index.ts', () => {
    const {default: mockAuth} = jest.requireActual('../auth/index.ts')
    mockAuth.prototype.ready = jest.fn().mockResolvedValue({access_token: 'access_token'})
    return mockAuth
})

describe('useCustomQuery', () => {
    beforeEach(() => nock.cleanAll())
    afterEach(() => {
        expect(nock.pendingMocks()).toHaveLength(0)
    })
    test('useCustomQuery returns data on success', async () => {
        const mockRes = {data: '123'}
        const apiName = 'hello-world'
        mockQueryEndpoint(apiName, mockRes)
        const {result} = renderHookWithProviders(() => {
            const clientConfig = {
                parameters: {
                    clientId: 'CLIENT_ID',
                    siteId: 'SITE_ID',
                    organizationId: 'ORG_ID',
                    shortCode: 'SHORT_CODE'
                },
                proxy: 'http://localhost:8888/mobify/proxy/api'
            }
            return useCustomQuery({
                options: {
                    method: 'GET',
                    customApiPathParameters: {
                        endpointPath: 'test-hello-world',
                        apiName
                    }
                },
                clientConfig,
                rawResponse: false
            })
        })
        await waitAndExpectSuccess(() => result.current)
        expect(result.current.data).toEqual(mockRes)
    })
})
