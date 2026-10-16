--
-- PostgreSQL database dump
--


-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-10-15 20:02:32

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3 (class 3079 OID 66716)
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- TOC entry 5729 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


--
-- TOC entry 2 (class 3079 OID 57348)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5730 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 1141 (class 1247 OID 57387)
-- Name: item_tipo; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.item_tipo AS ENUM (
    'PRODUCTO',
    'SERVICIO'
);


ALTER TYPE public.item_tipo OWNER TO postgres;

--
-- TOC entry 1198 (class 1247 OID 67445)
-- Name: timerange; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.timerange AS RANGE (
    subtype = time without time zone,
    multirange_type_name = public.timemultirange
);


ALTER TYPE public.timerange OWNER TO postgres;

--
-- TOC entry 283 (class 1255 OID 67659)
-- Name: check_schedule_overlap(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_schedule_overlap() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM sidro_employee_schedules
        WHERE employee_id = NEW.employee_id
          AND day_of_week = NEW.day_of_week
          AND id != COALESCE(NEW.id, -1)
          AND (NEW.start_time < end_time AND NEW.end_time > start_time)
    ) THEN
        RAISE EXCEPTION 'El horario se superpone con un turno existente del profesional.';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.check_schedule_overlap() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 237 (class 1259 OID 65893)
-- Name: appointment_google_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointment_google_events (
    id integer NOT NULL,
    appointment_id uuid NOT NULL,
    google_calendar_id integer NOT NULL,
    google_event_id character varying(255) NOT NULL
);


ALTER TABLE public.appointment_google_events OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 65892)
-- Name: appointment_google_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointment_google_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointment_google_events_id_seq OWNER TO postgres;

--
-- TOC entry 5731 (class 0 OID 0)
-- Dependencies: 236
-- Name: appointment_google_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointment_google_events_id_seq OWNED BY public.appointment_google_events.id;


--
-- TOC entry 245 (class 1259 OID 67561)
-- Name: appointment_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointment_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sidro_account_id uuid,
    item_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    appointment_id uuid,
    fecha_deseada_inicio timestamp with time zone NOT NULL,
    fecha_deseada_fin timestamp with time zone NOT NULL,
    estado character varying(50) DEFAULT 'PENDIENTE'::character varying,
    notas_cliente text,
    notas_admin text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT appointment_requests_estado_check CHECK (((estado)::text = ANY ((ARRAY['PENDIENTE'::character varying, 'PENDIENTE_VINCULACION'::character varying, 'CONFIRMADA'::character varying, 'RECHAZADA'::character varying, 'CANCELADA'::character varying, 'CADUCADA'::character varying, 'PROPUESTA_CAMBIO'::character varying])::text[]))),
    CONSTRAINT chk_solicitud_valida CHECK ((fecha_deseada_fin > fecha_deseada_inicio))
);


ALTER TABLE public.appointment_requests OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 57495)
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    item_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    fecha_inicio timestamp with time zone NOT NULL,
    fecha_fin timestamp with time zone NOT NULL,
    estado character varying DEFAULT 'PROGRAMADA'::character varying,
    notas text,
    google_event_id character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 57633)
-- Name: business_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_config (
    id integer NOT NULL,
    config_key character varying(100) NOT NULL,
    config_value text,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.business_config OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 57632)
-- Name: business_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.business_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.business_config_id_seq OWNER TO postgres;

--
-- TOC entry 5732 (class 0 OID 0)
-- Dependencies: 232
-- Name: business_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.business_config_id_seq OWNED BY public.business_config.id;


--
-- TOC entry 227 (class 1259 OID 57529)
-- Name: cash_registers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cash_registers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fecha_apertura timestamp with time zone DEFAULT now() NOT NULL,
    fecha_cierre timestamp with time zone,
    monto_inicial numeric DEFAULT 0 NOT NULL,
    total_ventas_sistema numeric DEFAULT 0,
    total_gastos_sistema numeric DEFAULT 0,
    monto_esperado numeric DEFAULT 0,
    monto_real numeric DEFAULT 0,
    diferencia numeric DEFAULT 0,
    estado character varying DEFAULT 'ABIERTA'::character varying,
    observaciones text,
    usuario_id uuid,
    fecha timestamp with time zone,
    CONSTRAINT cash_registers_estado_check CHECK (((estado)::text = ANY (ARRAY[('ABIERTA'::character varying)::text, ('CERRADA'::character varying)::text])))
);


ALTER TABLE public.cash_registers OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 57391)
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying NOT NULL,
    telefono character varying,
    email character varying,
    ultima_visita timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    cedula character varying,
    direccion text,
    CONSTRAINT clients_cedula_check CHECK (((length((cedula)::text) = 10) OR (length((cedula)::text) = 13)))
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 67544)
-- Name: employee_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_services (
    employee_id uuid NOT NULL,
    item_id uuid NOT NULL,
    duration_minutes integer
);


ALTER TABLE public.employee_services OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 67523)
-- Name: employee_time_blocks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_time_blocks (
    id integer NOT NULL,
    employee_id uuid NOT NULL,
    fecha_inicio timestamp with time zone NOT NULL,
    fecha_fin timestamp with time zone NOT NULL,
    tipo character varying(50) NOT NULL,
    motivo text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT chk_fecha_valida CHECK ((fecha_fin > fecha_inicio)),
    CONSTRAINT employee_time_blocks_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['DESCANSO'::character varying, 'DIA_LIBRE'::character varying, 'VACACIONES'::character varying, 'OTRO'::character varying])::text[])))
);


ALTER TABLE public.employee_time_blocks OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 67522)
-- Name: employee_time_blocks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_time_blocks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_time_blocks_id_seq OWNER TO postgres;

--
-- TOC entry 5733 (class 0 OID 0)
-- Dependencies: 242
-- Name: employee_time_blocks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_time_blocks_id_seq OWNED BY public.employee_time_blocks.id;


--
-- TOC entry 241 (class 1259 OID 67501)
-- Name: employee_working_hours; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_working_hours (
    id integer NOT NULL,
    employee_id uuid NOT NULL,
    dia_semana integer NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    is_active boolean DEFAULT true,
    CONSTRAINT chk_hora_valida CHECK ((hora_fin > hora_inicio)),
    CONSTRAINT employee_working_hours_dia_semana_check CHECK (((dia_semana >= 0) AND (dia_semana <= 6)))
);


ALTER TABLE public.employee_working_hours OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 67500)
-- Name: employee_working_hours_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_working_hours_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_working_hours_id_seq OWNER TO postgres;

--
-- TOC entry 5734 (class 0 OID 0)
-- Dependencies: 240
-- Name: employee_working_hours_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_working_hours_id_seq OWNED BY public.employee_working_hours.id;


--
-- TOC entry 224 (class 1259 OID 57452)
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying NOT NULL,
    telefono character varying,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 67827)
-- Name: expense_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expense_categories (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    codigo character varying(50) NOT NULL,
    descripcion text,
    tipo character varying(20) DEFAULT 'LOCAL'::character varying NOT NULL,
    icono character varying(50) DEFAULT 'category'::character varying NOT NULL,
    color character varying(30) DEFAULT 'blue'::character varying NOT NULL,
    es_sistema boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.expense_categories OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 67826)
-- Name: expense_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.expense_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expense_categories_id_seq OWNER TO postgres;

--
-- TOC entry 5735 (class 0 OID 0)
-- Dependencies: 257
-- Name: expense_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expense_categories_id_seq OWNED BY public.expense_categories.id;


--
-- TOC entry 228 (class 1259 OID 57549)
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    monto numeric NOT NULL,
    categoria text NOT NULL,
    descripcion text,
    fecha timestamp with time zone DEFAULT now() NOT NULL,
    metodo_pago text DEFAULT 'EFECTIVO'::text,
    usuario_id uuid
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 67798)
-- Name: google_calendar_sync_queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.google_calendar_sync_queue (
    id integer NOT NULL,
    appointment_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    status character varying(50) DEFAULT 'PENDING'::character varying,
    attempts integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.google_calendar_sync_queue OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 67797)
-- Name: google_calendar_sync_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.google_calendar_sync_queue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.google_calendar_sync_queue_id_seq OWNER TO postgres;

--
-- TOC entry 5736 (class 0 OID 0)
-- Dependencies: 255
-- Name: google_calendar_sync_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.google_calendar_sync_queue_id_seq OWNED BY public.google_calendar_sync_queue.id;


--
-- TOC entry 235 (class 1259 OID 65873)
-- Name: google_calendars; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.google_calendars (
    id integer NOT NULL,
    calendar_id character varying(255) NOT NULL,
    employee_id uuid,
    description character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.google_calendars OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 65872)
-- Name: google_calendars_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.google_calendars_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.google_calendars_id_seq OWNER TO postgres;

--
-- TOC entry 5737 (class 0 OID 0)
-- Dependencies: 234
-- Name: google_calendars_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.google_calendars_id_seq OWNED BY public.google_calendars.id;


--
-- TOC entry 222 (class 1259 OID 57410)
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying NOT NULL,
    precio numeric NOT NULL,
    tipo public.item_tipo NOT NULL,
    stock integer,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    duration_minutes integer,
    is_reservable boolean DEFAULT false,
    padding_minutes integer DEFAULT 0,
    CONSTRAINT items_precio_check CHECK ((precio >= (0)::numeric)),
    CONSTRAINT items_stock_check CHECK (((stock IS NULL) OR (stock >= 0)))
);


ALTER TABLE public.items OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 67601)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sidro_account_id uuid NOT NULL,
    admin_id uuid NOT NULL,
    token_hash text NOT NULL,
    is_used boolean DEFAULT false,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 57595)
-- Name: payment_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sale_id uuid NOT NULL,
    monto numeric NOT NULL,
    metodo_pago character varying DEFAULT 'EFECTIVO'::character varying,
    notas text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    fecha timestamp with time zone DEFAULT now(),
    CONSTRAINT payment_history_monto_check CHECK ((monto > (0)::numeric))
);


ALTER TABLE public.payment_history OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 57563)
-- Name: sale_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_details (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sale_id uuid NOT NULL,
    item_id uuid NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario numeric NOT NULL,
    subtotal numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    nombre_producto character varying NOT NULL,
    CONSTRAINT sale_details_cantidad_check CHECK ((cantidad > 0)),
    CONSTRAINT sale_details_precio_unitario_check CHECK ((precio_unitario >= (0)::numeric)),
    CONSTRAINT sale_details_subtotal_check CHECK ((subtotal >= (0)::numeric))
);


ALTER TABLE public.sale_details OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 57616)
-- Name: sale_receipts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_receipts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sale_id uuid NOT NULL,
    receipt_html text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.sale_receipts OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 57466)
-- Name: sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fecha timestamp with time zone DEFAULT now() NOT NULL,
    total numeric NOT NULL,
    metodo_pago character varying,
    client_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    client_nombre character varying DEFAULT 'Consumidor Final'::character varying,
    client_cedula character varying DEFAULT '9999999999'::character varying,
    tax_rate numeric,
    estado_pago character varying DEFAULT 'PAGADO'::character varying,
    saldo_pendiente numeric DEFAULT 0,
    monto_pagado numeric DEFAULT 0,
    tipo_pago character varying DEFAULT 'EFECTIVO'::character varying,
    total_pagado numeric DEFAULT 0,
    CONSTRAINT sales_total_check CHECK ((total >= (0)::numeric))
);


ALTER TABLE public.sales OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 67471)
-- Name: sidro_account_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sidro_account_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sidro_account_id uuid NOT NULL,
    client_id uuid NOT NULL,
    admin_id uuid NOT NULL,
    fecha_vinculacion timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true
);


ALTER TABLE public.sidro_account_links OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 67746)
-- Name: sidro_appointment_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sidro_appointment_requests (
    id integer NOT NULL,
    sidro_account_id uuid NOT NULL,
    service_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    request_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    status character varying(50) DEFAULT 'PENDIENTE'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    official_appointment_id uuid,
    proposed_date date,
    proposed_start_time time without time zone,
    proposed_end_time time without time zone
);


ALTER TABLE public.sidro_appointment_requests OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 67745)
-- Name: sidro_appointment_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sidro_appointment_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sidro_appointment_requests_id_seq OWNER TO postgres;

--
-- TOC entry 5738 (class 0 OID 0)
-- Dependencies: 253
-- Name: sidro_appointment_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sidro_appointment_requests_id_seq OWNED BY public.sidro_appointment_requests.id;


--
-- TOC entry 238 (class 1259 OID 67452)
-- Name: sidro_client_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sidro_client_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre_completo character varying(255) NOT NULL,
    telefono character varying(20) NOT NULL,
    email character varying(255),
    password_hash text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.sidro_client_accounts OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 67730)
-- Name: sidro_employee_blocks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sidro_employee_blocks (
    id integer NOT NULL,
    employee_id uuid NOT NULL,
    block_date date NOT NULL,
    start_time time without time zone,
    end_time time without time zone,
    reason character varying(255),
    block_type character varying(50) DEFAULT 'BLOQUEO_MANUAL'::character varying
);


ALTER TABLE public.sidro_employee_blocks OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 67729)
-- Name: sidro_employee_blocks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sidro_employee_blocks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sidro_employee_blocks_id_seq OWNER TO postgres;

--
-- TOC entry 5739 (class 0 OID 0)
-- Dependencies: 251
-- Name: sidro_employee_blocks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sidro_employee_blocks_id_seq OWNED BY public.sidro_employee_blocks.id;


--
-- TOC entry 250 (class 1259 OID 67710)
-- Name: sidro_employee_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sidro_employee_schedules (
    id integer NOT NULL,
    employee_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    CONSTRAINT sidro_employee_schedules_check CHECK ((start_time < end_time)),
    CONSTRAINT sidro_employee_schedules_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);


ALTER TABLE public.sidro_employee_schedules OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 67709)
-- Name: sidro_employee_schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sidro_employee_schedules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sidro_employee_schedules_id_seq OWNER TO postgres;

--
-- TOC entry 5740 (class 0 OID 0)
-- Dependencies: 249
-- Name: sidro_employee_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sidro_employee_schedules_id_seq OWNED BY public.sidro_employee_schedules.id;


--
-- TOC entry 248 (class 1259 OID 67688)
-- Name: sidro_service_professionals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sidro_service_professionals (
    id integer NOT NULL,
    service_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    specific_duration_minutes integer
);


ALTER TABLE public.sidro_service_professionals OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 67687)
-- Name: sidro_service_professionals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sidro_service_professionals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sidro_service_professionals_id_seq OWNER TO postgres;

--
-- TOC entry 5741 (class 0 OID 0)
-- Dependencies: 247
-- Name: sidro_service_professionals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sidro_service_professionals_id_seq OWNED BY public.sidro_service_professionals.id;


--
-- TOC entry 223 (class 1259 OID 57430)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying NOT NULL,
    password text NOT NULL,
    role character varying NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tax_rate numeric DEFAULT 0,
    business_name character varying,
    business_ruc character varying,
    business_address text,
    business_phone character varying,
    employee_id uuid,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('admin'::character varying)::text, ('user'::character varying)::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 5365 (class 2604 OID 65896)
-- Name: appointment_google_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_google_events ALTER COLUMN id SET DEFAULT nextval('public.appointment_google_events_id_seq'::regclass);


--
-- TOC entry 5361 (class 2604 OID 57636)
-- Name: business_config id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_config ALTER COLUMN id SET DEFAULT nextval('public.business_config_id_seq'::regclass);


--
-- TOC entry 5375 (class 2604 OID 67526)
-- Name: employee_time_blocks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_time_blocks ALTER COLUMN id SET DEFAULT nextval('public.employee_time_blocks_id_seq'::regclass);


--
-- TOC entry 5373 (class 2604 OID 67504)
-- Name: employee_working_hours id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_working_hours ALTER COLUMN id SET DEFAULT nextval('public.employee_working_hours_id_seq'::regclass);


--
-- TOC entry 5396 (class 2604 OID 67830)
-- Name: expense_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_categories ALTER COLUMN id SET DEFAULT nextval('public.expense_categories_id_seq'::regclass);


--
-- TOC entry 5391 (class 2604 OID 67801)
-- Name: google_calendar_sync_queue id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.google_calendar_sync_queue ALTER COLUMN id SET DEFAULT nextval('public.google_calendar_sync_queue_id_seq'::regclass);


--
-- TOC entry 5363 (class 2604 OID 65876)
-- Name: google_calendars id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.google_calendars ALTER COLUMN id SET DEFAULT nextval('public.google_calendars_id_seq'::regclass);


--
-- TOC entry 5388 (class 2604 OID 67749)
-- Name: sidro_appointment_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_appointment_requests ALTER COLUMN id SET DEFAULT nextval('public.sidro_appointment_requests_id_seq'::regclass);


--
-- TOC entry 5386 (class 2604 OID 67733)
-- Name: sidro_employee_blocks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_employee_blocks ALTER COLUMN id SET DEFAULT nextval('public.sidro_employee_blocks_id_seq'::regclass);


--
-- TOC entry 5385 (class 2604 OID 67713)
-- Name: sidro_employee_schedules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_employee_schedules ALTER COLUMN id SET DEFAULT nextval('public.sidro_employee_schedules_id_seq'::regclass);


--
-- TOC entry 5384 (class 2604 OID 67691)
-- Name: sidro_service_professionals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_service_professionals ALTER COLUMN id SET DEFAULT nextval('public.sidro_service_professionals_id_seq'::regclass);


--
-- TOC entry 5702 (class 0 OID 65893)
-- Dependencies: 237
-- Data for Name: appointment_google_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5710 (class 0 OID 67561)
-- Dependencies: 245
-- Data for Name: appointment_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5691 (class 0 OID 57495)
-- Dependencies: 226
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5698 (class 0 OID 57633)
-- Dependencies: 233
-- Data for Name: business_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5692 (class 0 OID 57529)
-- Dependencies: 227
-- Data for Name: cash_registers; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5686 (class 0 OID 57391)
-- Dependencies: 221
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5709 (class 0 OID 67544)
-- Dependencies: 244
-- Data for Name: employee_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5708 (class 0 OID 67523)
-- Dependencies: 243
-- Data for Name: employee_time_blocks; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5706 (class 0 OID 67501)
-- Dependencies: 241
-- Data for Name: employee_working_hours; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5689 (class 0 OID 57452)
-- Dependencies: 224
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5723 (class 0 OID 67827)
-- Dependencies: 258
-- Data for Name: expense_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5693 (class 0 OID 57549)
-- Dependencies: 228
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5721 (class 0 OID 67798)
-- Dependencies: 256
-- Data for Name: google_calendar_sync_queue; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5700 (class 0 OID 65873)
-- Dependencies: 235
-- Data for Name: google_calendars; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5687 (class 0 OID 57410)
-- Dependencies: 222
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5711 (class 0 OID 67601)
-- Dependencies: 246
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5695 (class 0 OID 57595)
-- Dependencies: 230
-- Data for Name: payment_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5694 (class 0 OID 57563)
-- Dependencies: 229
-- Data for Name: sale_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5696 (class 0 OID 57616)
-- Dependencies: 231
-- Data for Name: sale_receipts; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5690 (class 0 OID 57466)
-- Dependencies: 225
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5704 (class 0 OID 67471)
-- Dependencies: 239
-- Data for Name: sidro_account_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5719 (class 0 OID 67746)
-- Dependencies: 254
-- Data for Name: sidro_appointment_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5703 (class 0 OID 67452)
-- Dependencies: 238
-- Data for Name: sidro_client_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5717 (class 0 OID 67730)
-- Dependencies: 252
-- Data for Name: sidro_employee_blocks; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5715 (class 0 OID 67710)
-- Dependencies: 250
-- Data for Name: sidro_employee_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5713 (class 0 OID 67688)
-- Dependencies: 248
-- Data for Name: sidro_service_professionals; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5688 (class 0 OID 57430)
-- Dependencies: 223
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Datos COPY omitidos para compartir únicamente estructura.


--
-- TOC entry 5742 (class 0 OID 0)
-- Dependencies: 236
-- Name: appointment_google_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- Estado de secuencia omitido.


--
-- TOC entry 5743 (class 0 OID 0)
-- Dependencies: 232
-- Name: business_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- Estado de secuencia omitido.


--
-- TOC entry 5744 (class 0 OID 0)
-- Dependencies: 242
-- Name: employee_time_blocks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- Estado de secuencia omitido.


--
-- TOC entry 5745 (class 0 OID 0)
-- Dependencies: 240
-- Name: employee_working_hours_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- Estado de secuencia omitido.


--
-- TOC entry 5746 (class 0 OID 0)
-- Dependencies: 257
-- Name: expense_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- Estado de secuencia omitido.


--
-- TOC entry 5747 (class 0 OID 0)
-- Dependencies: 255
-- Name: google_calendar_sync_queue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- Estado de secuencia omitido.


--
-- TOC entry 5748 (class 0 OID 0)
-- Dependencies: 234
-- Name: google_calendars_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- Estado de secuencia omitido.


--
-- TOC entry 5749 (class 0 OID 0)
-- Dependencies: 253
-- Name: sidro_appointment_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- Estado de secuencia omitido.


--
-- TOC entry 5750 (class 0 OID 0)
-- Dependencies: 251
-- Name: sidro_employee_blocks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- Estado de secuencia omitido.


--
-- TOC entry 5751 (class 0 OID 0)
-- Dependencies: 249
-- Name: sidro_employee_schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- Estado de secuencia omitido.


--
-- TOC entry 5752 (class 0 OID 0)
-- Dependencies: 247
-- Name: sidro_service_professionals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

-- Estado de secuencia omitido.


--
-- TOC entry 5458 (class 2606 OID 65904)
-- Name: appointment_google_events appointment_google_events_appointment_id_google_calendar_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_google_events
    ADD CONSTRAINT appointment_google_events_appointment_id_google_calendar_id_key UNIQUE (appointment_id, google_calendar_id);


--
-- TOC entry 5460 (class 2606 OID 65902)
-- Name: appointment_google_events appointment_google_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_google_events
    ADD CONSTRAINT appointment_google_events_pkey PRIMARY KEY (id);


--
-- TOC entry 5480 (class 2606 OID 67580)
-- Name: appointment_requests appointment_requests_employee_id_tstzrange_excl; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_requests
    ADD CONSTRAINT appointment_requests_employee_id_tstzrange_excl EXCLUDE USING gist (employee_id WITH =, tstzrange(fecha_deseada_inicio, fecha_deseada_fin) WITH &&) WHERE (((estado)::text = 'PENDIENTE_VINCULACION'::text));


--
-- TOC entry 5482 (class 2606 OID 67578)
-- Name: appointment_requests appointment_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_requests
    ADD CONSTRAINT appointment_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 5438 (class 2606 OID 57513)
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- TOC entry 5450 (class 2606 OID 57645)
-- Name: business_config business_config_config_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_config
    ADD CONSTRAINT business_config_config_key_key UNIQUE (config_key);


--
-- TOC entry 5452 (class 2606 OID 57643)
-- Name: business_config business_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_config
    ADD CONSTRAINT business_config_pkey PRIMARY KEY (id);


--
-- TOC entry 5440 (class 2606 OID 57548)
-- Name: cash_registers cash_registers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cash_registers
    ADD CONSTRAINT cash_registers_pkey PRIMARY KEY (id);


--
-- TOC entry 5422 (class 2606 OID 57409)
-- Name: clients clients_cedula_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_cedula_key UNIQUE (cedula);


--
-- TOC entry 5424 (class 2606 OID 57407)
-- Name: clients clients_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_email_key UNIQUE (email);


--
-- TOC entry 5426 (class 2606 OID 57405)
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- TOC entry 5478 (class 2606 OID 67550)
-- Name: employee_services employee_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_services
    ADD CONSTRAINT employee_services_pkey PRIMARY KEY (employee_id, item_id);


--
-- TOC entry 5476 (class 2606 OID 67538)
-- Name: employee_time_blocks employee_time_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_time_blocks
    ADD CONSTRAINT employee_time_blocks_pkey PRIMARY KEY (id);


--
-- TOC entry 5472 (class 2606 OID 67516)
-- Name: employee_working_hours employee_working_hours_employee_id_dia_semana_timerange_excl; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_working_hours
    ADD CONSTRAINT employee_working_hours_employee_id_dia_semana_timerange_excl EXCLUDE USING gist (employee_id WITH =, dia_semana WITH =, public.timerange(hora_inicio, hora_fin) WITH &&);


--
-- TOC entry 5474 (class 2606 OID 67514)
-- Name: employee_working_hours employee_working_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_working_hours
    ADD CONSTRAINT employee_working_hours_pkey PRIMARY KEY (id);


--
-- TOC entry 5434 (class 2606 OID 57465)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- TOC entry 5500 (class 2606 OID 67849)
-- Name: expense_categories expense_categories_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT expense_categories_codigo_key UNIQUE (codigo);


--
-- TOC entry 5502 (class 2606 OID 67847)
-- Name: expense_categories expense_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT expense_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5442 (class 2606 OID 57562)
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- TOC entry 5498 (class 2606 OID 67810)
-- Name: google_calendar_sync_queue google_calendar_sync_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.google_calendar_sync_queue
    ADD CONSTRAINT google_calendar_sync_queue_pkey PRIMARY KEY (id);


--
-- TOC entry 5454 (class 2606 OID 65886)
-- Name: google_calendars google_calendars_calendar_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.google_calendars
    ADD CONSTRAINT google_calendars_calendar_id_key UNIQUE (calendar_id);


--
-- TOC entry 5456 (class 2606 OID 65884)
-- Name: google_calendars google_calendars_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.google_calendars
    ADD CONSTRAINT google_calendars_pkey PRIMARY KEY (id);


--
-- TOC entry 5428 (class 2606 OID 57429)
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- TOC entry 5484 (class 2606 OID 67615)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5446 (class 2606 OID 57610)
-- Name: payment_history payment_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5444 (class 2606 OID 57584)
-- Name: sale_details sale_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_details
    ADD CONSTRAINT sale_details_pkey PRIMARY KEY (id);


--
-- TOC entry 5448 (class 2606 OID 57626)
-- Name: sale_receipts sale_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_receipts
    ADD CONSTRAINT sale_receipts_pkey PRIMARY KEY (id);


--
-- TOC entry 5436 (class 2606 OID 57489)
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- TOC entry 5470 (class 2606 OID 67482)
-- Name: sidro_account_links sidro_account_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_account_links
    ADD CONSTRAINT sidro_account_links_pkey PRIMARY KEY (id);


--
-- TOC entry 5496 (class 2606 OID 67760)
-- Name: sidro_appointment_requests sidro_appointment_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_appointment_requests
    ADD CONSTRAINT sidro_appointment_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 5462 (class 2606 OID 67470)
-- Name: sidro_client_accounts sidro_client_accounts_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_client_accounts
    ADD CONSTRAINT sidro_client_accounts_email_key UNIQUE (email);


--
-- TOC entry 5464 (class 2606 OID 67466)
-- Name: sidro_client_accounts sidro_client_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_client_accounts
    ADD CONSTRAINT sidro_client_accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 5466 (class 2606 OID 67468)
-- Name: sidro_client_accounts sidro_client_accounts_telefono_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_client_accounts
    ADD CONSTRAINT sidro_client_accounts_telefono_key UNIQUE (telefono);


--
-- TOC entry 5492 (class 2606 OID 67739)
-- Name: sidro_employee_blocks sidro_employee_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_employee_blocks
    ADD CONSTRAINT sidro_employee_blocks_pkey PRIMARY KEY (id);


--
-- TOC entry 5490 (class 2606 OID 67722)
-- Name: sidro_employee_schedules sidro_employee_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_employee_schedules
    ADD CONSTRAINT sidro_employee_schedules_pkey PRIMARY KEY (id);


--
-- TOC entry 5486 (class 2606 OID 67696)
-- Name: sidro_service_professionals sidro_service_professionals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_service_professionals
    ADD CONSTRAINT sidro_service_professionals_pkey PRIMARY KEY (id);


--
-- TOC entry 5488 (class 2606 OID 67698)
-- Name: sidro_service_professionals sidro_service_professionals_service_id_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_service_professionals
    ADD CONSTRAINT sidro_service_professionals_service_id_employee_id_key UNIQUE (service_id, employee_id);


--
-- TOC entry 5430 (class 2606 OID 57449)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5432 (class 2606 OID 57451)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5467 (class 1259 OID 67499)
-- Name: idx_client_historical_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_client_historical_active ON public.sidro_account_links USING btree (client_id) WHERE (is_active = true);


--
-- TOC entry 5493 (class 1259 OID 67781)
-- Name: idx_requests_account; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requests_account ON public.sidro_appointment_requests USING btree (sidro_account_id);


--
-- TOC entry 5494 (class 1259 OID 67782)
-- Name: idx_requests_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_requests_time ON public.sidro_appointment_requests USING btree (employee_id, request_date);


--
-- TOC entry 5468 (class 1259 OID 67498)
-- Name: idx_sidro_account_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_sidro_account_active ON public.sidro_account_links USING btree (sidro_account_id) WHERE (is_active = true);


--
-- TOC entry 5538 (class 2620 OID 67728)
-- Name: sidro_employee_schedules trg_check_schedule_overlap; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_check_schedule_overlap BEFORE INSERT OR UPDATE ON public.sidro_employee_schedules FOR EACH ROW EXECUTE FUNCTION public.check_schedule_overlap();


--
-- TOC entry 5513 (class 2606 OID 65905)
-- Name: appointment_google_events appointment_google_events_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_google_events
    ADD CONSTRAINT appointment_google_events_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- TOC entry 5514 (class 2606 OID 65910)
-- Name: appointment_google_events appointment_google_events_google_calendar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_google_events
    ADD CONSTRAINT appointment_google_events_google_calendar_id_fkey FOREIGN KEY (google_calendar_id) REFERENCES public.google_calendars(id) ON DELETE CASCADE;


--
-- TOC entry 5522 (class 2606 OID 67596)
-- Name: appointment_requests appointment_requests_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_requests
    ADD CONSTRAINT appointment_requests_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;


--
-- TOC entry 5523 (class 2606 OID 67591)
-- Name: appointment_requests appointment_requests_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_requests
    ADD CONSTRAINT appointment_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- TOC entry 5524 (class 2606 OID 67586)
-- Name: appointment_requests appointment_requests_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_requests
    ADD CONSTRAINT appointment_requests_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- TOC entry 5525 (class 2606 OID 67581)
-- Name: appointment_requests appointment_requests_sidro_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_requests
    ADD CONSTRAINT appointment_requests_sidro_account_id_fkey FOREIGN KEY (sidro_account_id) REFERENCES public.sidro_client_accounts(id) ON DELETE SET NULL;


--
-- TOC entry 5505 (class 2606 OID 57514)
-- Name: appointments appt_client_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appt_client_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- TOC entry 5506 (class 2606 OID 57524)
-- Name: appointments appt_employee_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appt_employee_fk FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- TOC entry 5507 (class 2606 OID 57519)
-- Name: appointments appt_item_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appt_item_fk FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- TOC entry 5520 (class 2606 OID 67551)
-- Name: employee_services employee_services_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_services
    ADD CONSTRAINT employee_services_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- TOC entry 5521 (class 2606 OID 67556)
-- Name: employee_services employee_services_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_services
    ADD CONSTRAINT employee_services_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;


--
-- TOC entry 5519 (class 2606 OID 67539)
-- Name: employee_time_blocks employee_time_blocks_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_time_blocks
    ADD CONSTRAINT employee_time_blocks_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- TOC entry 5518 (class 2606 OID 67517)
-- Name: employee_working_hours employee_working_hours_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_working_hours
    ADD CONSTRAINT employee_working_hours_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- TOC entry 5536 (class 2606 OID 67811)
-- Name: google_calendar_sync_queue google_calendar_sync_queue_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.google_calendar_sync_queue
    ADD CONSTRAINT google_calendar_sync_queue_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- TOC entry 5537 (class 2606 OID 67816)
-- Name: google_calendar_sync_queue google_calendar_sync_queue_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.google_calendar_sync_queue
    ADD CONSTRAINT google_calendar_sync_queue_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- TOC entry 5512 (class 2606 OID 65887)
-- Name: google_calendars google_calendars_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.google_calendars
    ADD CONSTRAINT google_calendars_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- TOC entry 5526 (class 2606 OID 67621)
-- Name: password_reset_tokens password_reset_tokens_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- TOC entry 5527 (class 2606 OID 67616)
-- Name: password_reset_tokens password_reset_tokens_sidro_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_sidro_account_id_fkey FOREIGN KEY (sidro_account_id) REFERENCES public.sidro_client_accounts(id) ON DELETE CASCADE;


--
-- TOC entry 5510 (class 2606 OID 57611)
-- Name: payment_history payment_history_sale_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_sale_fk FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- TOC entry 5508 (class 2606 OID 57585)
-- Name: sale_details sale_details_item_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_details
    ADD CONSTRAINT sale_details_item_fk FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- TOC entry 5509 (class 2606 OID 57590)
-- Name: sale_details sale_details_sale_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_details
    ADD CONSTRAINT sale_details_sale_fk FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- TOC entry 5511 (class 2606 OID 57627)
-- Name: sale_receipts sale_receipts_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_receipts
    ADD CONSTRAINT sale_receipts_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- TOC entry 5504 (class 2606 OID 57490)
-- Name: sales sales_client_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_client_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- TOC entry 5515 (class 2606 OID 67493)
-- Name: sidro_account_links sidro_account_links_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_account_links
    ADD CONSTRAINT sidro_account_links_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- TOC entry 5516 (class 2606 OID 67488)
-- Name: sidro_account_links sidro_account_links_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_account_links
    ADD CONSTRAINT sidro_account_links_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE RESTRICT;


--
-- TOC entry 5517 (class 2606 OID 67483)
-- Name: sidro_account_links sidro_account_links_sidro_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_account_links
    ADD CONSTRAINT sidro_account_links_sidro_account_id_fkey FOREIGN KEY (sidro_account_id) REFERENCES public.sidro_client_accounts(id) ON DELETE RESTRICT;


--
-- TOC entry 5532 (class 2606 OID 67771)
-- Name: sidro_appointment_requests sidro_appointment_requests_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_appointment_requests
    ADD CONSTRAINT sidro_appointment_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- TOC entry 5533 (class 2606 OID 67776)
-- Name: sidro_appointment_requests sidro_appointment_requests_official_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_appointment_requests
    ADD CONSTRAINT sidro_appointment_requests_official_appointment_id_fkey FOREIGN KEY (official_appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;


--
-- TOC entry 5534 (class 2606 OID 67766)
-- Name: sidro_appointment_requests sidro_appointment_requests_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_appointment_requests
    ADD CONSTRAINT sidro_appointment_requests_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.items(id);


--
-- TOC entry 5535 (class 2606 OID 67761)
-- Name: sidro_appointment_requests sidro_appointment_requests_sidro_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_appointment_requests
    ADD CONSTRAINT sidro_appointment_requests_sidro_account_id_fkey FOREIGN KEY (sidro_account_id) REFERENCES public.sidro_client_accounts(id);


--
-- TOC entry 5531 (class 2606 OID 67740)
-- Name: sidro_employee_blocks sidro_employee_blocks_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_employee_blocks
    ADD CONSTRAINT sidro_employee_blocks_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- TOC entry 5530 (class 2606 OID 67723)
-- Name: sidro_employee_schedules sidro_employee_schedules_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_employee_schedules
    ADD CONSTRAINT sidro_employee_schedules_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- TOC entry 5528 (class 2606 OID 67704)
-- Name: sidro_service_professionals sidro_service_professionals_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_service_professionals
    ADD CONSTRAINT sidro_service_professionals_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- TOC entry 5529 (class 2606 OID 67699)
-- Name: sidro_service_professionals sidro_service_professionals_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sidro_service_professionals
    ADD CONSTRAINT sidro_service_professionals_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.items(id) ON DELETE CASCADE;


--
-- TOC entry 5503 (class 2606 OID 67821)
-- Name: users users_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


-- Completed on 2026-10-15 20:02:32

--
-- PostgreSQL database dump complete
--


