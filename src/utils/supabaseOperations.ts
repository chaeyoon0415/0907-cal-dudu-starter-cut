import { supabase } from './supabaseClient';
import type { OperationLog, Slot, Request, Candidate } from '../types';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class SupabaseOperationManager {
  // 신청 제출 (고객이 슬롯을 선택하고 제출)
  async submitRequest(
    customerId: string,
    selectedSlotIds: string[]
  ): Promise<{
    success: boolean;
    requestId?: string;
    error?: string;
  }> {
    try {
      const operationId = generateUUID();

      // RPC 호출
      const { data, error } = await supabase.rpc('submit_request', {
        p_customer_id: customerId,
        p_slot_ids: selectedSlotIds,
        p_operation_id: operationId,
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Failed to submit request',
        };
      }

      if (data?.success) {
        return {
          success: true,
          requestId: data.requestId,
        };
      }

      return {
        success: false,
        error: data?.error || 'Unknown error',
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }

  // 어드민 확정
  async confirmRequest(
    requestId: string,
    selectedSlotId: string,
    adminId: string
  ): Promise<{
    success: boolean;
    error?: string;
    affectedRequests?: string[];
  }> {
    try {
      const operationId = generateUUID();

      const { data, error } = await supabase.rpc('confirm_request', {
        p_request_id: requestId,
        p_slot_id: selectedSlotId,
        p_admin_id: adminId,
        p_operation_id: operationId,
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Failed to confirm request',
        };
      }

      if (data?.success) {
        return {
          success: true,
          affectedRequests: data.affectedRequests || [],
        };
      }

      return {
        success: false,
        error: data?.error || 'Unknown error',
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }

  // 재선택 제출
  async resubmitRequest(
    customerId: string,
    requestId: string,
    newSlotIds: string[]
  ): Promise<{
    success: boolean;
    requestId?: string;
    error?: string;
  }> {
    try {
      const operationId = generateUUID();

      const { data, error } = await supabase.rpc('resubmit_request', {
        p_customer_id: customerId,
        p_request_id: requestId,
        p_slot_ids: newSlotIds,
        p_operation_id: operationId,
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Failed to resubmit request',
        };
      }

      if (data?.success) {
        return {
          success: true,
          requestId: data.requestId,
        };
      }

      return {
        success: false,
        error: data?.error || 'Unknown error',
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }

  // 모든 슬롯 조회
  async getSlots(): Promise<{ slots: Slot[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('slots')
        .select('*')
        .order('date')
        .order('time_label');

      if (error) {
        return { slots: [], error: error.message };
      }

      const slots = ((data as any) || []).map((row: any) => ({
        id: row.id,
        date: row.date,
        timeLabel: row.time_label,
        status: row.status,
        confirmedAt: row.confirmed_at,
        confirmedBy: row.confirmed_by,
      }));

      return { slots };
    } catch (error) {
      return { slots: [], error: String(error) };
    }
  }

  // 고객의 신청 조회
  async getCustomerRequests(customerId: string): Promise<{
    requests: Array<{
      request: Request;
      candidates: Candidate[];
    }>;
    error?: string;
  }> {
    try {
      // 신청 조회
      const { data: requestsData, error: reqError } = await supabase
        .from('requests')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (reqError) {
        return { requests: [], error: reqError.message };
      }

      const requests = ((requestsData as any) || []).map((row: any) => ({
        id: row.id,
        customerId: row.customer_id,
        version: row.version,
        createdAt: row.created_at,
        status: row.status,
        confirmedSlotId: row.confirmed_slot_id,
        confirmedAt: row.confirmed_at,
      }));

      // 후보 조회
      const requestIds = requests.map((r: any) => r.id);
      const { data: candidatesData, error: candError } = await supabase
        .from('candidates')
        .select('*')
        .in('request_id', requestIds);

      if (candError) {
        return { requests: [], error: candError.message };
      }

      const candidates = ((candidatesData as any) || []).map((row: any) => ({
        id: row.id,
        requestId: row.request_id,
        slotId: row.slot_id,
        priority: row.priority,
        version: row.version,
        queueSeq: row.queue_seq,
      }));

      const result = requests.map((request: any) => ({
        request,
        candidates: candidates.filter((c: any) => c.requestId === request.id),
      }));

      return { requests: result };
    } catch (error) {
      return { requests: [], error: String(error) };
    }
  }

  // 모든 신청 조회 (어드민용)
  async getAllRequests(): Promise<{
    requests: Array<{
      request: Request;
      candidates: Candidate[];
    }>;
    error?: string;
  }> {
    try {
      const { data: requestsData, error: reqError } = await supabase
        .from('requests')
        .select('*')
        .order('created_at');

      if (reqError) {
        return { requests: [], error: reqError.message };
      }

      const requests = ((requestsData as any) || []).map((row: any) => ({
        id: row.id,
        customerId: row.customer_id,
        version: row.version,
        createdAt: row.created_at,
        status: row.status,
        confirmedSlotId: row.confirmed_slot_id,
        confirmedAt: row.confirmed_at,
      }));

      const requestIds = requests.map((r: any) => r.id);
      if (requestIds.length === 0) {
        return { requests: [] };
      }

      const { data: candidatesData, error: candError } = await supabase
        .from('candidates')
        .select('*')
        .in('request_id', requestIds);

      if (candError) {
        return { requests: [], error: candError.message };
      }

      const candidates = ((candidatesData as any) || []).map((row: any) => ({
        id: row.id,
        requestId: row.request_id,
        slotId: row.slot_id,
        priority: row.priority,
        version: row.version,
        queueSeq: row.queue_seq,
      }));

      const result = requests.map((request: any) => ({
        request,
        candidates: candidates.filter((c: any) => c.requestId === request.id),
      }));

      return { requests: result };
    } catch (error) {
      return { requests: [], error: String(error) };
    }
  }

  // 운영 로그 조회 (어드민용)
  async getOperationLogs(): Promise<{ logs: OperationLog[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('operation_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { logs: [], error: error.message };
      }

      const logs = ((data as any) || []).map((row: any) => ({
        id: row.id,
        timestamp: row.timestamp,
        action: row.action,
        requestId: row.request_id,
        adminId: row.admin_id,
        slotId: row.slot_id,
        status: row.status,
        error: row.error_message,
      }));

      return { logs };
    } catch (error) {
      return { logs: [], error: String(error) };
    }
  }
}
