--
-- PostgreSQL database dump
--

\restrict CzDOxUTnBT9n0BDYccHfQC0jHWGKgL08qegQT7q5FkipNjFqLikyb53Aj0gIpPT

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    date date NOT NULL,
    time_in time without time zone,
    time_out time without time zone,
    status character varying(20) DEFAULT 'present'::character varying,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT attendance_status_check CHECK (((status)::text = ANY ((ARRAY['present'::character varying, 'absent'::character varying, 'late'::character varying, 'half-day'::character varying, 'leave'::character varying])::text[])))
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attendance_id_seq OWNER TO postgres;

--
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(50) NOT NULL,
    resource character varying(50),
    resource_id integer,
    details text,
    ip_address character varying(45),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: biometric_devices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.biometric_devices (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    ip_address character varying(45) NOT NULL,
    port integer DEFAULT 4370,
    serial_number character varying(100),
    model character varying(100),
    location character varying(200),
    timezone character varying(50) DEFAULT 'UTC'::character varying,
    is_active boolean DEFAULT true,
    last_sync timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.biometric_devices OWNER TO postgres;

--
-- Name: biometric_devices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.biometric_devices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.biometric_devices_id_seq OWNER TO postgres;

--
-- Name: biometric_devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.biometric_devices_id_seq OWNED BY public.biometric_devices.id;


--
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(20),
    address text,
    phone character varying(20),
    email character varying(100),
    is_head_office boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_id integer
);


ALTER TABLE public.branches OWNER TO postgres;

--
-- Name: branches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.branches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.branches_id_seq OWNER TO postgres;

--
-- Name: branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.branches_id_seq OWNED BY public.branches.id;


--
-- Name: clearance_item_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clearance_item_status (
    id integer NOT NULL,
    clearance_id integer NOT NULL,
    item_id integer NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    completed_by integer,
    completed_at timestamp without time zone,
    remarks text,
    CONSTRAINT clearance_item_status_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'waived'::character varying])::text[])))
);


ALTER TABLE public.clearance_item_status OWNER TO postgres;

--
-- Name: clearance_item_status_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clearance_item_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clearance_item_status_id_seq OWNER TO postgres;

--
-- Name: clearance_item_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clearance_item_status_id_seq OWNED BY public.clearance_item_status.id;


--
-- Name: clearance_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clearance_items (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    department_responsible character varying(50),
    is_required boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.clearance_items OWNER TO postgres;

--
-- Name: clearance_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clearance_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clearance_items_id_seq OWNER TO postgres;

--
-- Name: clearance_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clearance_items_id_seq OWNED BY public.clearance_items.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    code character varying(50),
    address text,
    phone character varying(30),
    email character varying(100),
    website character varying(200),
    contact_person character varying(100),
    contact_phone character varying(30),
    contact_email character varying(100),
    tin character varying(50),
    license_type character varying(20) DEFAULT 'demo'::character varying,
    status character varying(20) DEFAULT 'active'::character varying,
    registration_date date DEFAULT CURRENT_DATE,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT companies_license_type_check CHECK (((license_type)::text = ANY ((ARRAY['demo'::character varying, 'trial'::character varying, 'full'::character varying, 'enterprise'::character varying])::text[]))),
    CONSTRAINT companies_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'suspended'::character varying])::text[])))
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.companies_id_seq OWNER TO postgres;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: company_modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_modules (
    id integer NOT NULL,
    company_id integer NOT NULL,
    module_id integer NOT NULL,
    is_enabled boolean DEFAULT true
);


ALTER TABLE public.company_modules OWNER TO postgres;

--
-- Name: company_modules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.company_modules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_modules_id_seq OWNER TO postgres;

--
-- Name: company_modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.company_modules_id_seq OWNED BY public.company_modules.id;


--
-- Name: demo_licenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.demo_licenses (
    id integer NOT NULL,
    license_key character varying(100) NOT NULL,
    company_id integer,
    company_name character varying(200) NOT NULL,
    contact_name character varying(100),
    contact_email character varying(100),
    contact_phone character varying(30),
    issued_date date DEFAULT CURRENT_DATE NOT NULL,
    expiry_date date NOT NULL,
    duration_days integer DEFAULT 15,
    status character varying(20) DEFAULT 'active'::character varying,
    notes text,
    issued_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT demo_licenses_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'expired'::character varying, 'revoked'::character varying, 'suspended'::character varying])::text[])))
);


ALTER TABLE public.demo_licenses OWNER TO postgres;

--
-- Name: demo_licenses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.demo_licenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.demo_licenses_id_seq OWNER TO postgres;

--
-- Name: demo_licenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.demo_licenses_id_seq OWNED BY public.demo_licenses.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(20),
    description text,
    manager_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_id integer
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_id_seq OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: document_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_templates (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(20),
    type character varying(30) NOT NULL,
    content text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT document_templates_type_check CHECK (((type)::text = ANY ((ARRAY['letter'::character varying, 'certificate'::character varying, 'voucher'::character varying, 'report'::character varying, 'contract'::character varying])::text[])))
);


ALTER TABLE public.document_templates OWNER TO postgres;

--
-- Name: document_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.document_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.document_templates_id_seq OWNER TO postgres;

--
-- Name: document_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.document_templates_id_seq OWNED BY public.document_templates.id;


--
-- Name: employee_banks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_banks (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    bank_name character varying(100) NOT NULL,
    account_number character varying(50) NOT NULL,
    account_holder character varying(150),
    branch character varying(100),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.employee_banks OWNER TO postgres;

--
-- Name: employee_banks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_banks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_banks_id_seq OWNER TO postgres;

--
-- Name: employee_banks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_banks_id_seq OWNED BY public.employee_banks.id;


--
-- Name: employee_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.employee_categories OWNER TO postgres;

--
-- Name: employee_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_categories_id_seq OWNER TO postgres;

--
-- Name: employee_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_categories_id_seq OWNED BY public.employee_categories.id;


--
-- Name: employee_clearance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_clearance (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    termination_date date,
    reason text,
    termination_type character varying(20),
    status character varying(20) DEFAULT 'pending'::character varying,
    initiated_by integer,
    approved_by integer,
    approved_at timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT employee_clearance_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying, 'cleared'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.employee_clearance OWNER TO postgres;

--
-- Name: employee_clearance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_clearance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_clearance_id_seq OWNER TO postgres;

--
-- Name: employee_clearance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_clearance_id_seq OWNED BY public.employee_clearance.id;


--
-- Name: employee_dependents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_dependents (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    full_name character varying(150) NOT NULL,
    relationship character varying(50) NOT NULL,
    date_of_birth date,
    phone character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.employee_dependents OWNER TO postgres;

--
-- Name: employee_dependents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_dependents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_dependents_id_seq OWNER TO postgres;

--
-- Name: employee_dependents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_dependents_id_seq OWNED BY public.employee_dependents.id;


--
-- Name: employee_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_documents (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    document_type character varying(100) NOT NULL,
    document_name character varying(200),
    file_path text,
    expiry_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.employee_documents OWNER TO postgres;

--
-- Name: employee_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_documents_id_seq OWNER TO postgres;

--
-- Name: employee_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_documents_id_seq OWNED BY public.employee_documents.id;


--
-- Name: employee_education; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_education (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    institution character varying(200) NOT NULL,
    degree character varying(100),
    field_of_study character varying(100),
    start_date date,
    end_date date,
    grade character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.employee_education OWNER TO postgres;

--
-- Name: employee_education_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_education_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_education_id_seq OWNER TO postgres;

--
-- Name: employee_education_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_education_id_seq OWNED BY public.employee_education.id;


--
-- Name: employee_hobbies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_hobbies (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    hobby character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.employee_hobbies OWNER TO postgres;

--
-- Name: employee_hobbies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_hobbies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_hobbies_id_seq OWNER TO postgres;

--
-- Name: employee_hobbies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_hobbies_id_seq OWNED BY public.employee_hobbies.id;


--
-- Name: employee_shifts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_shifts (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    shift_id integer NOT NULL,
    start_date date NOT NULL,
    end_date date,
    is_recurring boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.employee_shifts OWNER TO postgres;

--
-- Name: employee_shifts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_shifts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_shifts_id_seq OWNER TO postgres;

--
-- Name: employee_shifts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_shifts_id_seq OWNED BY public.employee_shifts.id;


--
-- Name: employee_work_experience; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_work_experience (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    company character varying(200) NOT NULL,
    "position" character varying(100),
    start_date date,
    end_date date,
    reason_leaving text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.employee_work_experience OWNER TO postgres;

--
-- Name: employee_work_experience_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_work_experience_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_work_experience_id_seq OWNER TO postgres;

--
-- Name: employee_work_experience_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_work_experience_id_seq OWNED BY public.employee_work_experience.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    title character varying(20),
    first_name character varying(100) NOT NULL,
    middle_name character varying(100),
    last_name character varying(100),
    nationality character varying(50),
    gender character varying(20),
    marital_status character varying(20),
    date_of_birth date,
    is_active boolean DEFAULT true,
    tin character varying(50),
    biold character varying(50),
    passport_id character varying(50),
    national_id character varying(50),
    category_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    department_id integer,
    position_id integer,
    phone character varying(20),
    email character varying(100),
    address text,
    emergency_contact character varying(100),
    emergency_phone character varying(20),
    hire_date date,
    salary numeric(12,2),
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    employment_stage_id integer,
    branch character varying(100),
    probation_start_date date,
    probation_end_date date,
    contract_end_date date,
    termination_date date,
    termination_reason text,
    branch_id integer,
    photo text,
    pension_number character varying(50),
    taxable_allowances numeric(12,2) DEFAULT 0,
    clearance_status character varying(20) DEFAULT 'not_applicable'::character varying,
    termination_type character varying(20)
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_id_seq OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: employment_stages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employment_stages (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    code character varying(20) NOT NULL,
    description text,
    is_active boolean DEFAULT true
);


ALTER TABLE public.employment_stages OWNER TO postgres;

--
-- Name: employment_stages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employment_stages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employment_stages_id_seq OWNER TO postgres;

--
-- Name: employment_stages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employment_stages_id_seq OWNED BY public.employment_stages.id;


--
-- Name: enhanced_payroll; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enhanced_payroll (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    pay_period_start date NOT NULL,
    pay_period_end date NOT NULL,
    basic_salary numeric(12,2) DEFAULT 0 NOT NULL,
    transport_allowance numeric(12,2) DEFAULT 0,
    housing_allowance numeric(12,2) DEFAULT 0,
    position_allowance numeric(12,2) DEFAULT 0,
    overtime_amount numeric(12,2) DEFAULT 0,
    other_allowances numeric(12,2) DEFAULT 0,
    other_deductions numeric(12,2) DEFAULT 0,
    income_tax numeric(12,2) DEFAULT 0,
    employee_pension numeric(12,2) DEFAULT 0,
    employer_pension numeric(12,2) DEFAULT 0,
    net_pay numeric(12,2) DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT enhanced_payroll_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'processed'::character varying, 'paid'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.enhanced_payroll OWNER TO postgres;

--
-- Name: enhanced_payroll_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.enhanced_payroll_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.enhanced_payroll_id_seq OWNER TO postgres;

--
-- Name: enhanced_payroll_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.enhanced_payroll_id_seq OWNED BY public.enhanced_payroll.id;


--
-- Name: generated_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.generated_documents (
    id integer NOT NULL,
    template_id integer,
    employee_id integer,
    voucher_id integer,
    document_type character varying(30) NOT NULL,
    reference_number character varying(50),
    title character varying(200),
    content text,
    status character varying(20) DEFAULT 'draft'::character varying,
    issued_by integer,
    issued_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    CONSTRAINT generated_documents_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'final'::character varying, 'issued'::character varying, 'generated'::character varying])::text[])))
);


ALTER TABLE public.generated_documents OWNER TO postgres;

--
-- Name: generated_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.generated_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.generated_documents_id_seq OWNER TO postgres;

--
-- Name: generated_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.generated_documents_id_seq OWNED BY public.generated_documents.id;


--
-- Name: item_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_id integer NOT NULL
);


ALTER TABLE public.item_categories OWNER TO postgres;

--
-- Name: item_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.item_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.item_categories_id_seq OWNER TO postgres;

--
-- Name: item_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.item_categories_id_seq OWNED BY public.item_categories.id;


--
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    category_id integer,
    unit character varying(20) DEFAULT 'pcs'::character varying,
    cost_price numeric(12,2) DEFAULT 0,
    selling_price numeric(12,2) DEFAULT 0,
    reorder_level numeric(12,2) DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_id integer NOT NULL
);


ALTER TABLE public.items OWNER TO postgres;

--
-- Name: items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.items_id_seq OWNER TO postgres;

--
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;


--
-- Name: leave_definitions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_definitions (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    leave_type_id integer NOT NULL,
    year integer NOT NULL,
    total_days integer DEFAULT 0 NOT NULL,
    used_days integer DEFAULT 0 NOT NULL,
    remaining_days integer GENERATED ALWAYS AS ((total_days - used_days)) STORED,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.leave_definitions OWNER TO postgres;

--
-- Name: leave_definitions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leave_definitions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leave_definitions_id_seq OWNER TO postgres;

--
-- Name: leave_definitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leave_definitions_id_seq OWNED BY public.leave_definitions.id;


--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_requests (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    leave_type_id integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_days integer NOT NULL,
    reason text,
    status character varying(20) DEFAULT 'pending'::character varying,
    approved_by integer,
    approved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT leave_requests_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.leave_requests OWNER TO postgres;

--
-- Name: leave_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leave_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leave_requests_id_seq OWNER TO postgres;

--
-- Name: leave_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leave_requests_id_seq OWNED BY public.leave_requests.id;


--
-- Name: leave_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_types (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(20),
    days_per_year integer DEFAULT 0 NOT NULL,
    is_paid boolean DEFAULT true,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.leave_types OWNER TO postgres;

--
-- Name: leave_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leave_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leave_types_id_seq OWNER TO postgres;

--
-- Name: leave_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leave_types_id_seq OWNED BY public.leave_types.id;


--
-- Name: membership_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.membership_members (
    id integer NOT NULL,
    company_id integer NOT NULL,
    plan_id integer,
    full_name character varying(200) NOT NULL,
    phone character varying(30),
    email character varying(200),
    id_number character varying(100),
    address text,
    photo_url text,
    start_date date DEFAULT CURRENT_DATE NOT NULL,
    end_date date NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    customer_id character varying(50),
    qr_code text,
    CONSTRAINT membership_members_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'expired'::character varying, 'suspended'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.membership_members OWNER TO postgres;

--
-- Name: membership_members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.membership_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.membership_members_id_seq OWNER TO postgres;

--
-- Name: membership_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.membership_members_id_seq OWNED BY public.membership_members.id;


--
-- Name: membership_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.membership_payments (
    id integer NOT NULL,
    company_id integer NOT NULL,
    member_id integer NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency character varying(10) DEFAULT 'ETB'::character varying,
    payment_method character varying(50) DEFAULT 'cash'::character varying,
    reference character varying(200),
    payment_date date DEFAULT CURRENT_DATE NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.membership_payments OWNER TO postgres;

--
-- Name: membership_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.membership_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.membership_payments_id_seq OWNER TO postgres;

--
-- Name: membership_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.membership_payments_id_seq OWNED BY public.membership_payments.id;


--
-- Name: membership_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.membership_plans (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name character varying(200) NOT NULL,
    type character varying(50) DEFAULT 'general'::character varying NOT NULL,
    description text,
    duration_days integer DEFAULT 30 NOT NULL,
    price numeric(12,2) DEFAULT 0 NOT NULL,
    currency character varying(10) DEFAULT 'ETB'::character varying,
    max_members integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT membership_plans_type_check CHECK (((type)::text = ANY ((ARRAY['gym'::character varying, 'parking'::character varying, 'club'::character varying, 'general'::character varying])::text[])))
);


ALTER TABLE public.membership_plans OWNER TO postgres;

--
-- Name: membership_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.membership_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.membership_plans_id_seq OWNER TO postgres;

--
-- Name: membership_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.membership_plans_id_seq OWNED BY public.membership_plans.id;


--
-- Name: modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modules (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    icon character varying(50),
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0
);


ALTER TABLE public.modules OWNER TO postgres;

--
-- Name: modules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.modules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.modules_id_seq OWNER TO postgres;

--
-- Name: modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.modules_id_seq OWNED BY public.modules.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    employee_id integer,
    title character varying(200) NOT NULL,
    message text,
    type character varying(30) DEFAULT 'info'::character varying,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notifications_type_check CHECK (((type)::text = ANY ((ARRAY['info'::character varying, 'warning'::character varying, 'alert'::character varying, 'success'::character varying])::text[])))
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: overtime_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.overtime_records (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    total_hours numeric(5,2) NOT NULL,
    rate_multiplier numeric(3,2) DEFAULT 1.5 NOT NULL,
    rate_type character varying(30) NOT NULL,
    amount numeric(12,2),
    status character varying(20) DEFAULT 'pending'::character varying,
    approved_by integer,
    approved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT overtime_records_rate_type_check CHECK (((rate_type)::text = ANY ((ARRAY['day'::character varying, 'night'::character varying, 'weekly_rest'::character varying, 'public_holiday'::character varying])::text[]))),
    CONSTRAINT overtime_records_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'paid'::character varying])::text[])))
);


ALTER TABLE public.overtime_records OWNER TO postgres;

--
-- Name: overtime_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.overtime_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.overtime_records_id_seq OWNER TO postgres;

--
-- Name: overtime_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.overtime_records_id_seq OWNED BY public.overtime_records.id;


--
-- Name: parking_gates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parking_gates (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(20) NOT NULL,
    type character varying(20) DEFAULT 'entry'::character varying NOT NULL,
    direction character varying(10) DEFAULT 'in'::character varying,
    status character varying(20) DEFAULT 'active'::character varying,
    ip_address character varying(45),
    port integer,
    serial_port character varying(50),
    barrier_open_delay integer DEFAULT 2,
    is_anpr_enabled boolean DEFAULT true,
    is_qr_enabled boolean DEFAULT true,
    is_nfc_enabled boolean DEFAULT false,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT parking_gates_direction_check CHECK (((direction)::text = ANY ((ARRAY['in'::character varying, 'out'::character varying, 'both'::character varying])::text[]))),
    CONSTRAINT parking_gates_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'maintenance'::character varying])::text[]))),
    CONSTRAINT parking_gates_type_check CHECK (((type)::text = ANY ((ARRAY['entry'::character varying, 'exit'::character varying, 'dual'::character varying])::text[])))
);


ALTER TABLE public.parking_gates OWNER TO postgres;

--
-- Name: parking_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parking_payments (
    id integer NOT NULL,
    company_id integer NOT NULL,
    session_id integer NOT NULL,
    vehicle_id integer,
    amount numeric(12,2) NOT NULL,
    currency character varying(10) DEFAULT 'ETB'::character varying,
    payment_method character varying(30) DEFAULT 'cash'::character varying NOT NULL,
    reference character varying(200),
    pos_terminal_id character varying(50),
    receipt_number character varying(50),
    paid_by character varying(200),
    notes text,
    payment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT parking_payments_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['cash'::character varying, 'telebirr'::character varying, 'cbebirr'::character varying, 'chapa'::character varying, 'santimpay'::character varying, 'bank'::character varying, 'pos'::character varying, 'credit_card'::character varying, 'debit_card'::character varying])::text[])))
);


ALTER TABLE public.parking_payments OWNER TO postgres;

--
-- Name: parking_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parking_sessions (
    id integer NOT NULL,
    company_id integer NOT NULL,
    vehicle_id integer,
    plate_number character varying(50),
    entry_gate_id integer,
    exit_gate_id integer,
    entry_camera_id integer,
    exit_camera_id integer,
    slot_id integer,
    entry_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    exit_time timestamp without time zone,
    duration_minutes integer,
    entry_image_url text,
    exit_image_url text,
    entry_plate_confidence numeric(5,2),
    exit_plate_confidence numeric(5,2),
    entry_method character varying(20) DEFAULT 'anpr'::character varying,
    exit_method character varying(20) DEFAULT 'anpr'::character varying,
    status character varying(20) DEFAULT 'active'::character varying,
    amount numeric(12,2) DEFAULT 0,
    paid boolean DEFAULT false,
    ticket_number character varying(50),
    qr_ticket_id integer,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT parking_sessions_entry_method_check CHECK (((entry_method)::text = ANY ((ARRAY['anpr'::character varying, 'qr'::character varying, 'nfc'::character varying, 'manual'::character varying, 'rfid'::character varying])::text[]))),
    CONSTRAINT parking_sessions_exit_method_check CHECK (((exit_method)::text = ANY ((ARRAY['anpr'::character varying, 'qr'::character varying, 'nfc'::character varying, 'manual'::character varying, 'rfid'::character varying])::text[]))),
    CONSTRAINT parking_sessions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'pending_payment'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.parking_sessions OWNER TO postgres;

--
-- Name: parking_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parking_slots (
    id integer NOT NULL,
    company_id integer NOT NULL,
    zone_id integer NOT NULL,
    slot_number character varying(20) NOT NULL,
    floor integer DEFAULT 0,
    status character varying(20) DEFAULT 'available'::character varying,
    type character varying(20) DEFAULT 'standard'::character varying,
    current_session_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT parking_slots_status_check CHECK (((status)::text = ANY ((ARRAY['available'::character varying, 'occupied'::character varying, 'reserved'::character varying, 'maintenance'::character varying])::text[]))),
    CONSTRAINT parking_slots_type_check CHECK (((type)::text = ANY ((ARRAY['standard'::character varying, 'vip'::character varying, 'disabled'::character varying, 'reserved'::character varying, 'electric'::character varying, 'staff'::character varying])::text[])))
);


ALTER TABLE public.parking_slots OWNER TO postgres;

--
-- Name: parking_vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parking_vehicles (
    id integer NOT NULL,
    company_id integer NOT NULL,
    plate_number character varying(50) NOT NULL,
    vehicle_type character varying(30) DEFAULT 'car'::character varying,
    vehicle_model character varying(100),
    vehicle_color character varying(50),
    owner_name character varying(200),
    owner_phone character varying(30),
    owner_email character varying(200),
    rfid_tag character varying(100),
    nfc_tag character varying(100),
    is_blacklisted boolean DEFAULT false,
    is_resident boolean DEFAULT false,
    subscription_id integer,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    customer_id integer,
    CONSTRAINT parking_vehicles_vehicle_type_check CHECK (((vehicle_type)::text = ANY ((ARRAY['car'::character varying, 'suv'::character varying, 'truck'::character varying, 'bus'::character varying, 'motorcycle'::character varying, 'bicycle'::character varying, 'other'::character varying])::text[])))
);


ALTER TABLE public.parking_vehicles OWNER TO postgres;

--
-- Name: parking_zones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parking_zones (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(20) NOT NULL,
    floor integer DEFAULT 0,
    description text,
    slot_count integer DEFAULT 0 NOT NULL,
    type character varying(20) DEFAULT 'standard'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT parking_zones_type_check CHECK (((type)::text = ANY ((ARRAY['standard'::character varying, 'vip'::character varying, 'disabled'::character varying, 'reserved'::character varying, 'electric'::character varying, 'staff'::character varying])::text[])))
);


ALTER TABLE public.parking_zones OWNER TO postgres;

--
-- Name: parking_access_logs; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.parking_access_logs AS
 SELECT ps.id AS session_id,
    ps.company_id,
    ps.ticket_number,
    COALESCE(pv.plate_number, ps.plate_number) AS plate_number,
    pv.vehicle_type,
    pv.vehicle_model,
    pv.vehicle_color,
    mm.full_name AS customer_name,
    mm.phone AS customer_phone,
    mm.customer_id AS customer_code,
    ps.entry_time,
    ps.exit_time,
    ps.duration_minutes,
    eg.name AS entry_gate,
    xg.name AS exit_gate,
    ps.entry_method,
    ps.exit_method,
    pz.name AS zone_name,
    psl.slot_number,
    ps.status AS session_status,
    ps.amount,
    ps.paid,
    pp.payment_method,
    pp.receipt_number,
    pp.created_at AS payment_time
   FROM (((((((public.parking_sessions ps
     LEFT JOIN public.parking_vehicles pv ON ((ps.vehicle_id = pv.id)))
     LEFT JOIN public.membership_members mm ON ((pv.customer_id = mm.id)))
     LEFT JOIN public.parking_gates eg ON ((ps.entry_gate_id = eg.id)))
     LEFT JOIN public.parking_gates xg ON ((ps.exit_gate_id = xg.id)))
     LEFT JOIN public.parking_slots psl ON ((ps.slot_id = psl.id)))
     LEFT JOIN public.parking_zones pz ON ((psl.zone_id = pz.id)))
     LEFT JOIN public.parking_payments pp ON ((pp.session_id = ps.id)));


ALTER VIEW public.parking_access_logs OWNER TO postgres;

--
-- Name: parking_cameras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parking_cameras (
    id integer NOT NULL,
    company_id integer NOT NULL,
    gate_id integer,
    name character varying(100) NOT NULL,
    code character varying(20) NOT NULL,
    ip_address character varying(45) NOT NULL,
    port integer DEFAULT 80,
    rtsp_url text,
    direction character varying(10) DEFAULT 'in'::character varying,
    status character varying(20) DEFAULT 'active'::character varying,
    protocol character varying(20) DEFAULT 'http'::character varying,
    confidence_threshold numeric(5,2) DEFAULT 85.00,
    last_heartbeat timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT parking_cameras_direction_check CHECK (((direction)::text = ANY ((ARRAY['in'::character varying, 'out'::character varying, 'both'::character varying])::text[]))),
    CONSTRAINT parking_cameras_protocol_check CHECK (((protocol)::text = ANY ((ARRAY['http'::character varying, 'rtsp'::character varying, 'onvif'::character varying, 'tcp_ip'::character varying])::text[]))),
    CONSTRAINT parking_cameras_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'offline'::character varying, 'maintenance'::character varying])::text[])))
);


ALTER TABLE public.parking_cameras OWNER TO postgres;

--
-- Name: parking_cameras_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parking_cameras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parking_cameras_id_seq OWNER TO postgres;

--
-- Name: parking_cameras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parking_cameras_id_seq OWNED BY public.parking_cameras.id;


--
-- Name: parking_gates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parking_gates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parking_gates_id_seq OWNER TO postgres;

--
-- Name: parking_gates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parking_gates_id_seq OWNED BY public.parking_gates.id;


--
-- Name: parking_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parking_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parking_payments_id_seq OWNER TO postgres;

--
-- Name: parking_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parking_payments_id_seq OWNED BY public.parking_payments.id;


--
-- Name: parking_qr_tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parking_qr_tickets (
    id integer NOT NULL,
    company_id integer NOT NULL,
    ticket_number character varying(50) NOT NULL,
    qr_code text NOT NULL,
    visitor_name character varying(200),
    visitor_phone character varying(30),
    visitor_plate character varying(50),
    purpose character varying(200),
    host_name character varying(200),
    host_phone character varying(30),
    valid_from timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    valid_until timestamp without time zone NOT NULL,
    is_used boolean DEFAULT false,
    used_at timestamp without time zone,
    session_id integer,
    status character varying(20) DEFAULT 'active'::character varying,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT parking_qr_tickets_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'used'::character varying, 'expired'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.parking_qr_tickets OWNER TO postgres;

--
-- Name: parking_qr_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parking_qr_tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parking_qr_tickets_id_seq OWNER TO postgres;

--
-- Name: parking_qr_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parking_qr_tickets_id_seq OWNED BY public.parking_qr_tickets.id;


--
-- Name: parking_rates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parking_rates (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name character varying(100) NOT NULL,
    vehicle_type character varying(30) DEFAULT 'car'::character varying,
    rate_type character varying(20) DEFAULT 'hourly'::character varying,
    base_rate numeric(12,2) DEFAULT 0 NOT NULL,
    per_hour_rate numeric(12,2) DEFAULT 0,
    per_day_rate numeric(12,2) DEFAULT 0,
    grace_period_minutes integer DEFAULT 15,
    max_daily_charge numeric(12,2),
    currency character varying(10) DEFAULT 'ETB'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT parking_rates_rate_type_check CHECK (((rate_type)::text = ANY ((ARRAY['hourly'::character varying, 'daily'::character varying, 'weekly'::character varying, 'monthly'::character varying, 'annual'::character varying, 'flat'::character varying, 'custom'::character varying])::text[]))),
    CONSTRAINT parking_rates_vehicle_type_check CHECK (((vehicle_type)::text = ANY ((ARRAY['car'::character varying, 'suv'::character varying, 'truck'::character varying, 'bus'::character varying, 'motorcycle'::character varying, 'bicycle'::character varying, 'all'::character varying, 'other'::character varying])::text[])))
);


ALTER TABLE public.parking_rates OWNER TO postgres;

--
-- Name: parking_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parking_rates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parking_rates_id_seq OWNER TO postgres;

--
-- Name: parking_rates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parking_rates_id_seq OWNED BY public.parking_rates.id;


--
-- Name: parking_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parking_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parking_sessions_id_seq OWNER TO postgres;

--
-- Name: parking_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parking_sessions_id_seq OWNED BY public.parking_sessions.id;


--
-- Name: parking_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parking_slots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parking_slots_id_seq OWNER TO postgres;

--
-- Name: parking_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parking_slots_id_seq OWNED BY public.parking_slots.id;


--
-- Name: parking_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parking_subscriptions (
    id integer NOT NULL,
    company_id integer NOT NULL,
    customer_id integer NOT NULL,
    vehicle_id integer,
    plan_type character varying(20) DEFAULT 'monthly'::character varying NOT NULL,
    start_date date DEFAULT CURRENT_DATE NOT NULL,
    end_date date NOT NULL,
    amount numeric(12,2) DEFAULT 0 NOT NULL,
    payment_method character varying(30) DEFAULT 'cash'::character varying,
    payment_reference character varying(200),
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    auto_renew boolean DEFAULT false,
    renewal_count integer DEFAULT 0,
    last_renewed_at timestamp without time zone,
    notes text,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT parking_subscriptions_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['cash'::character varying, 'telebirr'::character varying, 'cbebirr'::character varying, 'chapa'::character varying, 'santimpay'::character varying, 'bank'::character varying, 'pos'::character varying, 'credit_card'::character varying, 'debit_card'::character varying])::text[]))),
    CONSTRAINT parking_subscriptions_plan_type_check CHECK (((plan_type)::text = ANY ((ARRAY['monthly'::character varying, 'quarterly'::character varying, 'semi_annual'::character varying, 'annual'::character varying, 'custom'::character varying])::text[]))),
    CONSTRAINT parking_subscriptions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'expired'::character varying, 'cancelled'::character varying, 'pending'::character varying])::text[])))
);


ALTER TABLE public.parking_subscriptions OWNER TO postgres;

--
-- Name: parking_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parking_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parking_subscriptions_id_seq OWNER TO postgres;

--
-- Name: parking_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parking_subscriptions_id_seq OWNED BY public.parking_subscriptions.id;


--
-- Name: parking_vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parking_vehicles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parking_vehicles_id_seq OWNER TO postgres;

--
-- Name: parking_vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parking_vehicles_id_seq OWNED BY public.parking_vehicles.id;


--
-- Name: parking_zones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parking_zones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parking_zones_id_seq OWNER TO postgres;

--
-- Name: parking_zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parking_zones_id_seq OWNED BY public.parking_zones.id;


--
-- Name: paye_brackets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.paye_brackets (
    id integer NOT NULL,
    min_income numeric(12,2) NOT NULL,
    max_income numeric(12,2),
    rate numeric(5,4) NOT NULL,
    deductible_amount numeric(12,2) DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.paye_brackets OWNER TO postgres;

--
-- Name: paye_brackets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.paye_brackets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.paye_brackets_id_seq OWNER TO postgres;

--
-- Name: paye_brackets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.paye_brackets_id_seq OWNED BY public.paye_brackets.id;


--
-- Name: payroll; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payroll (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    pay_period_start date NOT NULL,
    pay_period_end date NOT NULL,
    basic_salary numeric(12,2) DEFAULT 0 NOT NULL,
    allowances numeric(12,2) DEFAULT 0,
    deductions numeric(12,2) DEFAULT 0,
    net_pay numeric(12,2) DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying,
    processed_by integer,
    processed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payroll_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'processed'::character varying, 'paid'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.payroll OWNER TO postgres;

--
-- Name: payroll_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payroll_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payroll_id_seq OWNER TO postgres;

--
-- Name: payroll_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payroll_id_seq OWNED BY public.payroll.id;


--
-- Name: payroll_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payroll_items (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(20),
    type character varying(20) NOT NULL,
    is_taxable boolean DEFAULT true,
    is_pensionable boolean DEFAULT true,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payroll_items_type_check CHECK (((type)::text = ANY ((ARRAY['allowance'::character varying, 'deduction'::character varying])::text[])))
);


ALTER TABLE public.payroll_items OWNER TO postgres;

--
-- Name: payroll_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payroll_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payroll_items_id_seq OWNER TO postgres;

--
-- Name: payroll_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payroll_items_id_seq OWNED BY public.payroll_items.id;


--
-- Name: payroll_periods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payroll_periods (
    id integer NOT NULL,
    year integer NOT NULL,
    month integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying,
    processed_by integer,
    processed_at timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_id integer,
    CONSTRAINT payroll_periods_month_check CHECK (((month >= 1) AND (month <= 12))),
    CONSTRAINT payroll_periods_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'finalized'::character varying, 'paid'::character varying])::text[])))
);


ALTER TABLE public.payroll_periods OWNER TO postgres;

--
-- Name: payroll_periods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payroll_periods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payroll_periods_id_seq OWNER TO postgres;

--
-- Name: payroll_periods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payroll_periods_id_seq OWNED BY public.payroll_periods.id;


--
-- Name: payroll_runs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payroll_runs (
    id integer NOT NULL,
    period_id integer NOT NULL,
    total_gross numeric(14,2) DEFAULT 0,
    total_paye numeric(14,2) DEFAULT 0,
    total_employee_pension numeric(14,2) DEFAULT 0,
    total_employer_pension numeric(14,2) DEFAULT 0,
    total_deductions numeric(14,2) DEFAULT 0,
    total_net numeric(14,2) DEFAULT 0,
    status character varying(20) DEFAULT 'pending'::character varying,
    processed_by integer,
    processed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payroll_runs_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processed'::character varying, 'approved'::character varying])::text[])))
);


ALTER TABLE public.payroll_runs OWNER TO postgres;

--
-- Name: payroll_runs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payroll_runs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payroll_runs_id_seq OWNER TO postgres;

--
-- Name: payroll_runs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payroll_runs_id_seq OWNED BY public.payroll_runs.id;


--
-- Name: pension_contributions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pension_contributions (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    payroll_item_id integer,
    period_id integer,
    employee_contribution numeric(12,2) DEFAULT 0 NOT NULL,
    employer_contribution numeric(12,2) DEFAULT 0 NOT NULL,
    total_contribution numeric(12,2) DEFAULT 0,
    contribution_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pension_contributions OWNER TO postgres;

--
-- Name: pension_contributions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pension_contributions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pension_contributions_id_seq OWNER TO postgres;

--
-- Name: pension_contributions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pension_contributions_id_seq OWNED BY public.pension_contributions.id;


--
-- Name: pension_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pension_settings (
    id integer NOT NULL,
    employee_rate numeric(5,4) DEFAULT 0.0700 NOT NULL,
    employer_rate numeric(5,4) DEFAULT 0.1100 NOT NULL,
    is_active boolean DEFAULT true,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pension_settings OWNER TO postgres;

--
-- Name: pension_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pension_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pension_settings_id_seq OWNER TO postgres;

--
-- Name: pension_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pension_settings_id_seq OWNED BY public.pension_settings.id;


--
-- Name: performance_evaluations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.performance_evaluations (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    reviewer_id integer,
    evaluation_date date DEFAULT CURRENT_DATE NOT NULL,
    rating integer,
    comments text,
    strengths text,
    improvements text,
    status character varying(20) DEFAULT 'draft'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT performance_evaluations_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT performance_evaluations_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'submitted'::character varying, 'acknowledged'::character varying])::text[])))
);


ALTER TABLE public.performance_evaluations OWNER TO postgres;

--
-- Name: performance_evaluations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.performance_evaluations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.performance_evaluations_id_seq OWNER TO postgres;

--
-- Name: performance_evaluations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.performance_evaluations_id_seq OWNED BY public.performance_evaluations.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    role_id integer NOT NULL,
    resource character varying(50) NOT NULL,
    can_view boolean DEFAULT false,
    can_create boolean DEFAULT false,
    can_edit boolean DEFAULT false,
    can_delete boolean DEFAULT false,
    can_approve boolean DEFAULT false
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: placement_benefits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.placement_benefits (
    id integer NOT NULL,
    placement_id integer NOT NULL,
    payroll_item_id integer NOT NULL,
    amount numeric(12,2) DEFAULT 0 NOT NULL,
    is_percentage boolean DEFAULT false,
    percentage_value numeric(5,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.placement_benefits OWNER TO postgres;

--
-- Name: placement_benefits_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.placement_benefits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.placement_benefits_id_seq OWNER TO postgres;

--
-- Name: placement_benefits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.placement_benefits_id_seq OWNED BY public.placement_benefits.id;


--
-- Name: placements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.placements (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    placement_type character varying(30) NOT NULL,
    employment_stage_id integer,
    department_id integer,
    position_id integer,
    branch character varying(100),
    salary numeric(12,2),
    start_date date NOT NULL,
    end_date date,
    reason text,
    previous_placement_id integer,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT placements_placement_type_check CHECK (((placement_type)::text = ANY ((ARRAY['initial'::character varying, 'promotion'::character varying, 'demotion'::character varying, 'transfer'::character varying, 'suspension'::character varying, 'termination'::character varying, 'probation'::character varying, 'permanent'::character varying])::text[])))
);


ALTER TABLE public.placements OWNER TO postgres;

--
-- Name: placements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.placements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.placements_id_seq OWNER TO postgres;

--
-- Name: placements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.placements_id_seq OWNED BY public.placements.id;


--
-- Name: positions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.positions (
    id integer NOT NULL,
    title character varying(100) NOT NULL,
    department_id integer,
    description text,
    min_salary numeric(12,2),
    max_salary numeric(12,2),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_id integer
);


ALTER TABLE public.positions OWNER TO postgres;

--
-- Name: positions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.positions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.positions_id_seq OWNER TO postgres;

--
-- Name: positions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.positions_id_seq OWNED BY public.positions.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    id integer NOT NULL,
    role_id integer NOT NULL,
    resource character varying(50) NOT NULL,
    can_view boolean DEFAULT false,
    can_create boolean DEFAULT false,
    can_edit boolean DEFAULT false,
    can_delete boolean DEFAULT false,
    can_approve boolean DEFAULT false
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.role_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_permissions_id_seq OWNER TO postgres;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_permissions_id_seq OWNED BY public.role_permissions.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value text NOT NULL,
    description text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.settings_id_seq OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: shifts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shifts (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.shifts OWNER TO postgres;

--
-- Name: shifts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shifts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shifts_id_seq OWNER TO postgres;

--
-- Name: shifts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shifts_id_seq OWNED BY public.shifts.id;


--
-- Name: stock_adjustments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_adjustments (
    id integer NOT NULL,
    item_id integer NOT NULL,
    warehouse_id integer NOT NULL,
    old_quantity numeric(12,2) NOT NULL,
    new_quantity numeric(12,2) NOT NULL,
    reason text,
    status character varying(20) DEFAULT 'pending'::character varying,
    approved_by integer,
    approved_at timestamp without time zone,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_id integer NOT NULL,
    CONSTRAINT stock_adjustments_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.stock_adjustments OWNER TO postgres;

--
-- Name: stock_adjustments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_adjustments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_adjustments_id_seq OWNER TO postgres;

--
-- Name: stock_adjustments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_adjustments_id_seq OWNED BY public.stock_adjustments.id;


--
-- Name: stock_balances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_balances (
    id integer NOT NULL,
    item_id integer NOT NULL,
    warehouse_id integer NOT NULL,
    quantity numeric(12,2) DEFAULT 0,
    company_id integer NOT NULL
);


ALTER TABLE public.stock_balances OWNER TO postgres;

--
-- Name: stock_balances_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_balances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_balances_id_seq OWNER TO postgres;

--
-- Name: stock_balances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_balances_id_seq OWNED BY public.stock_balances.id;


--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_movements (
    id integer NOT NULL,
    item_id integer NOT NULL,
    warehouse_id integer NOT NULL,
    movement_type character varying(20) NOT NULL,
    quantity numeric(12,2) NOT NULL,
    reference_type character varying(50),
    reference_id integer,
    notes text,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_id integer NOT NULL,
    CONSTRAINT stock_movements_movement_type_check CHECK (((movement_type)::text = ANY ((ARRAY['in'::character varying, 'out'::character varying, 'transfer_in'::character varying, 'transfer_out'::character varying, 'adjustment'::character varying])::text[])))
);


ALTER TABLE public.stock_movements OWNER TO postgres;

--
-- Name: stock_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_movements_id_seq OWNER TO postgres;

--
-- Name: stock_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_movements_id_seq OWNED BY public.stock_movements.id;


--
-- Name: stock_transfers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_transfers (
    id integer NOT NULL,
    item_id integer NOT NULL,
    from_warehouse_id integer NOT NULL,
    to_warehouse_id integer NOT NULL,
    quantity numeric(12,2) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    notes text,
    created_by integer,
    approved_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone,
    company_id integer NOT NULL,
    CONSTRAINT stock_transfers_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'in_transit'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.stock_transfers OWNER TO postgres;

--
-- Name: stock_transfers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_transfers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_transfers_id_seq OWNER TO postgres;

--
-- Name: stock_transfers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_transfers_id_seq OWNED BY public.stock_transfers.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100),
    email character varying(100) NOT NULL,
    password text NOT NULL,
    role character varying(20) DEFAULT 'admin'::character varying,
    role_id integer,
    is_active boolean DEFAULT true,
    phone character varying(20),
    branch_id integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_id integer
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: voucher_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.voucher_items (
    id integer NOT NULL,
    voucher_id integer NOT NULL,
    payroll_item_id integer,
    description text,
    quantity numeric(10,2) DEFAULT 1,
    unit_price numeric(12,2) DEFAULT 0,
    total_price numeric(12,2) GENERATED ALWAYS AS ((quantity * unit_price)) STORED,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.voucher_items OWNER TO postgres;

--
-- Name: voucher_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.voucher_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.voucher_items_id_seq OWNER TO postgres;

--
-- Name: voucher_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.voucher_items_id_seq OWNED BY public.voucher_items.id;


--
-- Name: vouchers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vouchers (
    id integer NOT NULL,
    voucher_type character varying(20) NOT NULL,
    code character varying(50) NOT NULL,
    employee_id integer,
    status character varying(20) DEFAULT 'prepared'::character varying,
    total_amount numeric(12,2) DEFAULT 0,
    notes text,
    prepared_by integer,
    approved_by integer,
    prepared_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    approved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT vouchers_status_check CHECK (((status)::text = ANY ((ARRAY['prepared'::character varying, 'approved'::character varying, 'void'::character varying, 'completed'::character varying])::text[]))),
    CONSTRAINT vouchers_voucher_type_check CHECK (((voucher_type)::text = ANY ((ARRAY['LV'::character varying, 'OTV'::character varying, 'FIV'::character varying, 'PBV'::character varying, 'PAV'::character varying, 'LDV'::character varying, 'PTV'::character varying, 'TERV'::character varying, 'SUS'::character varying, 'WOR'::character varying, 'CL'::character varying, 'SHIFT'::character varying])::text[])))
);


ALTER TABLE public.vouchers OWNER TO postgres;

--
-- Name: vouchers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vouchers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vouchers_id_seq OWNER TO postgres;

--
-- Name: vouchers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vouchers_id_seq OWNED BY public.vouchers.id;


--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouses (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(20) NOT NULL,
    location text,
    manager character varying(100),
    phone character varying(30),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_id integer NOT NULL
);


ALTER TABLE public.warehouses OWNER TO postgres;

--
-- Name: warehouses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.warehouses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.warehouses_id_seq OWNER TO postgres;

--
-- Name: warehouses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.warehouses_id_seq OWNED BY public.warehouses.id;


--
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: biometric_devices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biometric_devices ALTER COLUMN id SET DEFAULT nextval('public.biometric_devices_id_seq'::regclass);


--
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- Name: clearance_item_status id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clearance_item_status ALTER COLUMN id SET DEFAULT nextval('public.clearance_item_status_id_seq'::regclass);


--
-- Name: clearance_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clearance_items ALTER COLUMN id SET DEFAULT nextval('public.clearance_items_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: company_modules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_modules ALTER COLUMN id SET DEFAULT nextval('public.company_modules_id_seq'::regclass);


--
-- Name: demo_licenses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demo_licenses ALTER COLUMN id SET DEFAULT nextval('public.demo_licenses_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: document_templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_templates ALTER COLUMN id SET DEFAULT nextval('public.document_templates_id_seq'::regclass);


--
-- Name: employee_banks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_banks ALTER COLUMN id SET DEFAULT nextval('public.employee_banks_id_seq'::regclass);


--
-- Name: employee_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_categories ALTER COLUMN id SET DEFAULT nextval('public.employee_categories_id_seq'::regclass);


--
-- Name: employee_clearance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_clearance ALTER COLUMN id SET DEFAULT nextval('public.employee_clearance_id_seq'::regclass);


--
-- Name: employee_dependents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_dependents ALTER COLUMN id SET DEFAULT nextval('public.employee_dependents_id_seq'::regclass);


--
-- Name: employee_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_documents ALTER COLUMN id SET DEFAULT nextval('public.employee_documents_id_seq'::regclass);


--
-- Name: employee_education id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_education ALTER COLUMN id SET DEFAULT nextval('public.employee_education_id_seq'::regclass);


--
-- Name: employee_hobbies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_hobbies ALTER COLUMN id SET DEFAULT nextval('public.employee_hobbies_id_seq'::regclass);


--
-- Name: employee_shifts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_shifts ALTER COLUMN id SET DEFAULT nextval('public.employee_shifts_id_seq'::regclass);


--
-- Name: employee_work_experience id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_work_experience ALTER COLUMN id SET DEFAULT nextval('public.employee_work_experience_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: employment_stages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employment_stages ALTER COLUMN id SET DEFAULT nextval('public.employment_stages_id_seq'::regclass);


--
-- Name: enhanced_payroll id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enhanced_payroll ALTER COLUMN id SET DEFAULT nextval('public.enhanced_payroll_id_seq'::regclass);


--
-- Name: generated_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.generated_documents ALTER COLUMN id SET DEFAULT nextval('public.generated_documents_id_seq'::regclass);


--
-- Name: item_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_categories ALTER COLUMN id SET DEFAULT nextval('public.item_categories_id_seq'::regclass);


--
-- Name: items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);


--
-- Name: leave_definitions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_definitions ALTER COLUMN id SET DEFAULT nextval('public.leave_definitions_id_seq'::regclass);


--
-- Name: leave_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests ALTER COLUMN id SET DEFAULT nextval('public.leave_requests_id_seq'::regclass);


--
-- Name: leave_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_types ALTER COLUMN id SET DEFAULT nextval('public.leave_types_id_seq'::regclass);


--
-- Name: membership_members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_members ALTER COLUMN id SET DEFAULT nextval('public.membership_members_id_seq'::regclass);


--
-- Name: membership_payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_payments ALTER COLUMN id SET DEFAULT nextval('public.membership_payments_id_seq'::regclass);


--
-- Name: membership_plans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_plans ALTER COLUMN id SET DEFAULT nextval('public.membership_plans_id_seq'::regclass);


--
-- Name: modules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules ALTER COLUMN id SET DEFAULT nextval('public.modules_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: overtime_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.overtime_records ALTER COLUMN id SET DEFAULT nextval('public.overtime_records_id_seq'::regclass);


--
-- Name: parking_cameras id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_cameras ALTER COLUMN id SET DEFAULT nextval('public.parking_cameras_id_seq'::regclass);


--
-- Name: parking_gates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_gates ALTER COLUMN id SET DEFAULT nextval('public.parking_gates_id_seq'::regclass);


--
-- Name: parking_payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_payments ALTER COLUMN id SET DEFAULT nextval('public.parking_payments_id_seq'::regclass);


--
-- Name: parking_qr_tickets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_qr_tickets ALTER COLUMN id SET DEFAULT nextval('public.parking_qr_tickets_id_seq'::regclass);


--
-- Name: parking_rates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_rates ALTER COLUMN id SET DEFAULT nextval('public.parking_rates_id_seq'::regclass);


--
-- Name: parking_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_sessions ALTER COLUMN id SET DEFAULT nextval('public.parking_sessions_id_seq'::regclass);


--
-- Name: parking_slots id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_slots ALTER COLUMN id SET DEFAULT nextval('public.parking_slots_id_seq'::regclass);


--
-- Name: parking_subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.parking_subscriptions_id_seq'::regclass);


--
-- Name: parking_vehicles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_vehicles ALTER COLUMN id SET DEFAULT nextval('public.parking_vehicles_id_seq'::regclass);


--
-- Name: parking_zones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_zones ALTER COLUMN id SET DEFAULT nextval('public.parking_zones_id_seq'::regclass);


--
-- Name: paye_brackets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paye_brackets ALTER COLUMN id SET DEFAULT nextval('public.paye_brackets_id_seq'::regclass);


--
-- Name: payroll id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll ALTER COLUMN id SET DEFAULT nextval('public.payroll_id_seq'::regclass);


--
-- Name: payroll_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_items ALTER COLUMN id SET DEFAULT nextval('public.payroll_items_id_seq'::regclass);


--
-- Name: payroll_periods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_periods ALTER COLUMN id SET DEFAULT nextval('public.payroll_periods_id_seq'::regclass);


--
-- Name: payroll_runs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_runs ALTER COLUMN id SET DEFAULT nextval('public.payroll_runs_id_seq'::regclass);


--
-- Name: pension_contributions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pension_contributions ALTER COLUMN id SET DEFAULT nextval('public.pension_contributions_id_seq'::regclass);


--
-- Name: pension_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pension_settings ALTER COLUMN id SET DEFAULT nextval('public.pension_settings_id_seq'::regclass);


--
-- Name: performance_evaluations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.performance_evaluations ALTER COLUMN id SET DEFAULT nextval('public.performance_evaluations_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: placement_benefits id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.placement_benefits ALTER COLUMN id SET DEFAULT nextval('public.placement_benefits_id_seq'::regclass);


--
-- Name: placements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.placements ALTER COLUMN id SET DEFAULT nextval('public.placements_id_seq'::regclass);


--
-- Name: positions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions ALTER COLUMN id SET DEFAULT nextval('public.positions_id_seq'::regclass);


--
-- Name: role_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions ALTER COLUMN id SET DEFAULT nextval('public.role_permissions_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: shifts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts ALTER COLUMN id SET DEFAULT nextval('public.shifts_id_seq'::regclass);


--
-- Name: stock_adjustments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_adjustments ALTER COLUMN id SET DEFAULT nextval('public.stock_adjustments_id_seq'::regclass);


--
-- Name: stock_balances id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_balances ALTER COLUMN id SET DEFAULT nextval('public.stock_balances_id_seq'::regclass);


--
-- Name: stock_movements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements ALTER COLUMN id SET DEFAULT nextval('public.stock_movements_id_seq'::regclass);


--
-- Name: stock_transfers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transfers ALTER COLUMN id SET DEFAULT nextval('public.stock_transfers_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: voucher_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voucher_items ALTER COLUMN id SET DEFAULT nextval('public.voucher_items_id_seq'::regclass);


--
-- Name: vouchers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers ALTER COLUMN id SET DEFAULT nextval('public.vouchers_id_seq'::regclass);


--
-- Name: warehouses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses ALTER COLUMN id SET DEFAULT nextval('public.warehouses_id_seq'::regclass);


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (id, employee_id, date, time_in, time_out, status, remarks, created_at) FROM stdin;
1	1	2026-07-06	12:09:00	\N	present	\N	2026-07-06 12:09:46.235866
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, resource, resource_id, details, ip_address, created_at) FROM stdin;
\.


--
-- Data for Name: biometric_devices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.biometric_devices (id, name, ip_address, port, serial_number, model, location, timezone, is_active, last_sync, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, name, code, address, phone, email, is_head_office, is_active, created_at, company_id) FROM stdin;
1	Head Office	HO	Main Headquarters	\N	\N	t	t	2026-07-06 13:41:22.177676	1
2	Branch 1	BR1	First Branch Office	\N	\N	f	t	2026-07-06 13:41:22.177676	1
\.


--
-- Data for Name: clearance_item_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clearance_item_status (id, clearance_id, item_id, status, completed_by, completed_at, remarks) FROM stdin;
\.


--
-- Data for Name: clearance_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clearance_items (id, name, description, department_responsible, is_required, sort_order, is_active, created_at) FROM stdin;
1	Return Company Assets	Laptop, phone, ID card, access cards, keys	IT	t	1	t	2026-07-06 14:48:23.063421
2	Settle Final Dues	Outstanding loans, advances, salary adjustments	Finance	t	2	t	2026-07-06 14:48:23.063421
3	Handover Documents	Handover notes, project files, pending tasks	HR	t	3	t	2026-07-06 14:48:23.063421
4	Exit Interview	Conduct exit interview and collect feedback	HR	t	4	t	2026-07-06 14:48:23.063421
5	Benefits Settlement	Process final pay, leave encashment, pension	Finance	t	5	t	2026-07-06 14:48:23.063421
6	Clearance from Direct Supervisor	Sign-off from reporting manager	HR	t	6	t	2026-07-06 14:48:23.063421
7	Email & System Access Revoked	Deactivate email, VPN, and system accounts	IT	t	7	t	2026-07-06 14:48:23.063421
8	Medical Insurance Removal	Remove from medical insurance coverage	HR	t	8	t	2026-07-06 14:48:23.063421
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, name, code, address, phone, email, website, contact_person, contact_phone, contact_email, tin, license_type, status, registration_date, notes, created_at, updated_at) FROM stdin;
1	Gast Solar Mechanics PLC	CMP-GAST	\N	\N	\N	\N	\N	\N	admin@gastsolar.com	TIN-000001	enterprise	active	2026-07-06	\N	2026-07-06 15:15:39.466527	2026-07-06 15:15:39.466527
2	CENTURY MALL	CMP-MR97JOWY	tito st	0912009497	ephremawlachew299@gmail.com	\N	Ephrem Awulachew	0912009497		0013321648	trial	active	2026-07-06		2026-07-06 15:40:06.507134	2026-07-06 15:40:06.507134
3	ADOT CINEMA 	CMP-MR995G1O	tito st	0912009497	nebiyatsoccer59@gmail.com	\N	ephrem awlachew		nebiyatsoccer59@gmail.com	TIN-0000010	demo	active	2026-07-06		2026-07-06 16:24:59.463119	2026-07-06 16:26:16.201098
\.


--
-- Data for Name: company_modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_modules (id, company_id, module_id, is_enabled) FROM stdin;
1	1	6	t
2	1	8	t
3	1	3	t
4	1	9	t
5	1	7	t
6	1	4	t
7	1	1	t
8	1	2	t
9	1	5	t
10	2	1	t
12	3	1	t
13	1	10	t
\.


--
-- Data for Name: demo_licenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.demo_licenses (id, license_key, company_id, company_name, contact_name, contact_email, contact_phone, issued_date, expiry_date, duration_days, status, notes, issued_by, created_at, updated_at) FROM stdin;
1	DEMO-125B06-B61D95-0A5F35-45476C	3	ADOT CINEMA 	Ephrem Awulachew	ephremawlachew299@gmail.com	0912009497	2026-07-06	2026-07-21	15	active	\N	1	2026-07-06 16:31:46.765385	2026-07-06 16:31:46.765385
2	DEMO-D941FC-3977B9-6B0381-F414A3	1	Gast Solar Mechanics PLC	\N	admin@gastsolar.com	\N	2026-07-06	2026-07-21	15	active	\N	1	2026-07-06 16:57:42.341895	2026-07-06 16:57:42.341895
3	DEMO-379997-240144-B8E058-0C801A	3	ADOT CINEMA 	Ephrem Awulachew	ephremawlachew299@gmail.com	0912009497	2026-07-06	2026-07-21	15	active	\N	4	2026-07-06 19:46:15.804495	2026-07-06 19:46:15.804495
4	DEMO-F110E2-2DBD27-A8E332-15BF99	1	Gast Solar Mechanics PLC	\N	admin@gastsolar.com	\N	2026-07-07	2026-10-15	100	active	\N	4	2026-07-07 16:06:54.617776	2026-07-07 16:06:54.617776
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, name, code, description, manager_id, is_active, created_at, company_id) FROM stdin;
1	Human Resources	HR	Human Resources Department	\N	t	2026-07-06 11:45:46.0913	1
2	Information Technology	IT	Information Technology Department	\N	t	2026-07-06 11:45:46.0913	1
3	Finance	FIN	Finance and Accounting	\N	t	2026-07-06 11:45:46.0913	1
4	Operations	OPS	Operations Department	\N	t	2026-07-06 11:45:46.0913	1
5	Sales	SAL	Sales and Marketing	\N	t	2026-07-06 11:45:46.0913	1
\.


--
-- Data for Name: document_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_templates (id, name, code, type, content, is_active, created_at) FROM stdin;
1	Employment Letter	EMP_LTR	letter	\N	t	2026-07-06 13:41:22.194417
2	Termination Letter	TERM_LTR	letter	\N	t	2026-07-06 13:41:22.194417
3	Work Experience Certificate	WORK_CERT	certificate	\N	t	2026-07-06 13:41:22.194417
4	Clearance Letter	CLR_LTR	letter	\N	t	2026-07-06 13:41:22.194417
5	Promotion Letter	PROM_LTR	letter	\N	t	2026-07-06 13:41:22.194417
6	Bank Transfer Letter	BANK_LTR	letter	\N	t	2026-07-06 13:41:22.194417
7	Suspension Letter	SUS_LTR	letter	\N	t	2026-07-06 13:41:22.194417
8	Appointment Letter	APPOINT_LTR	letter	<h3 style="text-align:center;">{{company_name}}</h3>\n<h4 style="text-align:center;">APPOINTMENT LETTER</h4>\n<p><strong>Date:</strong> {{date}}</p>\n<p><strong>Employee Name:</strong> {{employee_name}}</p>\n<p>Dear {{employee_name}},</p>\n<p>We are pleased to appoint you as <strong>{{position}}</strong> in the <strong>{{department}}</strong> Department effective from <strong>{{start_date}}</strong>.</p>\n<p>Your monthly salary shall be <strong>{{salary}}</strong> and your employment shall be governed by the company's policies and procedures.</p>\n<p>Please sign and return a copy of this letter as acceptance of the appointment.</p>\n<p>We welcome you to our organization and wish you success in your role.</p>\n<br/>\n<p>Sincerely,</p>\n<p><strong>HR Manager</strong></p>\n<hr/>\n<p><strong>Employee Signature:</strong> __________________</p>\n<p><strong>Date:</strong> __________________</p>	t	2026-07-06 14:32:50.90496
9	Employment Confirmation Letter	CONFIRM_LTR	letter	<h3 style="text-align:center;">{{company_name}}</h3>\n<h4 style="text-align:center;">CONFIRMATION LETTER</h4>\n<p><strong>Date:</strong> {{date}}</p>\n<p>Dear {{employee_name}},</p>\n<p>Following the successful completion of your probation period, we are pleased to confirm your employment as <strong>{{position}}</strong> effective <strong>{{effective_date}}</strong>.</p>\n<p>We appreciate your contribution and look forward to your continued success with the company.</p>\n<br/>\n<p>Sincerely,</p>\n<p><strong>HR Manager</strong></p>	t	2026-07-06 14:32:50.90496
10	Transfer Letter	TRANSFER_LTR	letter	<h3 style="text-align:center;">{{company_name}}</h3>\n<h4 style="text-align:center;">TRANSFER LETTER</h4>\n<p><strong>Date:</strong> {{date}}</p>\n<p>Dear {{employee_name}},</p>\n<p>This letter serves to inform you that you are being transferred from <strong>{{current_department}}</strong> to <strong>{{new_department}}</strong> effective <strong>{{effective_date}}</strong>.</p>\n<p>Your position will change from <strong>{{current_position}}</strong> to <strong>{{new_position}}</strong>.</p>\n<p>We believe this move will benefit both your career growth and the organization.</p>\n<br/>\n<p>Sincerely,</p>\n<p><strong>HR Manager</strong></p>	t	2026-07-06 14:32:50.90496
11	Salary Increment Letter	SALARY_INC_LTR	letter	<h3 style="text-align:center;">{{company_name}}</h3>\n<h4 style="text-align:center;">SALARY INCREMENT LETTER</h4>\n<p><strong>Date:</strong> {{date}}</p>\n<p>Dear {{employee_name}},</p>\n<p>Based on your performance and contribution to the organization, your salary has been revised from <strong>{{old_salary}}</strong> to <strong>{{new_salary}}</strong> effective <strong>{{effective_date}}</strong>.</p>\n<p>Congratulations and thank you for your dedication.</p>\n<br/>\n<p>Sincerely,</p>\n<p><strong>HR Manager</strong></p>	t	2026-07-06 14:32:50.90496
12	Experience Letter	EXPERIENCE_LTR	letter	<h3 style="text-align:center;">{{company_name}}</h3>\n<h4 style="text-align:center;">EXPERIENCE LETTER</h4>\n<p><strong>Date:</strong> {{date}}</p>\n<p><strong>TO WHOM IT MAY CONCERN</strong></p>\n<p>This is to certify that <strong>{{employee_name}}</strong> worked with {{company_name}} as <strong>{{position}}</strong> from <strong>{{start_date}}</strong> to <strong>{{end_date}}</strong>.</p>\n<p>During this period, the employee performed duties diligently and maintained professional conduct.</p>\n<p>We wish him/her every success in future endeavors.</p>\n<br/>\n<p>Sincerely,</p>\n<p><strong>HR Manager</strong></p>	t	2026-07-06 14:32:50.90496
13	Relieving Letter	RELIEVE_LTR	letter	<h3 style="text-align:center;">{{company_name}}</h3>\n<h4 style="text-align:center;">RELIEVING LETTER</h4>\n<p><strong>Date:</strong> {{date}}</p>\n<p>Dear {{employee_name}},</p>\n<p>This letter confirms that you have been relieved from your duties as <strong>{{position}}</strong> effective <strong>{{effective_date}}</strong> following acceptance of your resignation.</p>\n<p>We thank you for your services and wish you success in your future career.</p>\n<br/>\n<p>Sincerely,</p>\n<p><strong>HR Manager</strong></p>	t	2026-07-06 14:32:50.90496
14	Warning Letter	WARNING_LTR	letter	<h3 style="text-align:center;">{{company_name}}</h3>\n<h4 style="text-align:center;">WARNING LETTER</h4>\n<p><strong>Date:</strong> {{date}}</p>\n<p><strong>Employee Name:</strong> {{employee_name}}</p>\n<p><strong>Subject:</strong> Warning for Misconduct</p>\n<p>Dear {{employee_name}},</p>\n<p>This letter serves as a formal warning regarding the following incident:</p>\n<p>{{incident_description}}</p>\n<p>You are expected to correct this behavior immediately. Further violations may result in disciplinary action.</p>\n<br/>\n<p>Sincerely,</p>\n<p><strong>HR Manager</strong></p>	t	2026-07-06 14:32:50.90496
15	Show Cause Letter	SHOW_CAUSE_LTR	letter	<h3 style="text-align:center;">{{company_name}}</h3>\n<h4 style="text-align:center;">SHOW CAUSE NOTICE</h4>\n<p><strong>Date:</strong> {{date}}</p>\n<p><strong>Employee Name:</strong> {{employee_name}}</p>\n<p>Dear {{employee_name}},</p>\n<p>You are required to explain in writing within <strong>{{response_days}}</strong> days why disciplinary action should not be taken against you regarding the following matter:</p>\n<p>{{incident_description}}</p>\n<p>Failure to respond within the specified period may result in appropriate disciplinary measures.</p>\n<br/>\n<p>Sincerely,</p>\n<p><strong>HR Manager</strong></p>	t	2026-07-06 14:32:50.90496
16	Resignation Acceptance Letter	RESIGN_ACCEPT_LTR	letter	<h3 style="text-align:center;">{{company_name}}</h3>\n<h4 style="text-align:center;">RESIGNATION ACCEPTANCE LETTER</h4>\n<p><strong>Date:</strong> {{date}}</p>\n<p>Dear {{employee_name}},</p>\n<p>We acknowledge receipt of your resignation dated <strong>{{resignation_date}}</strong> and accept it effective <strong>{{effective_date}}</strong>.</p>\n<p>We appreciate your contribution to the organization and wish you success in your future endeavors.</p>\n<br/>\n<p>Sincerely,</p>\n<p><strong>HR Manager</strong></p>	t	2026-07-06 14:32:50.90496
17	Leave Approval Letter	LEAVE_APPRV_LTR	letter	<h3 style="text-align:center;">{{company_name}}</h3>\n<h4 style="text-align:center;">LEAVE APPROVAL LETTER</h4>\n<p><strong>Date:</strong> {{date}}</p>\n<p>Dear {{employee_name}},</p>\n<p>Your leave request from <strong>{{leave_start}}</strong> to <strong>{{leave_end}}</strong> has been approved.</p>\n<p>We wish you a pleasant leave period.</p>\n<br/>\n<p>Sincerely,</p>\n<p><strong>HR Manager</strong></p>	t	2026-07-06 14:32:50.90496
18	No Objection Certificate (NOC)	NOC_CERT	certificate	<h3 style="text-align:center;">{{company_name}}</h3>\n<h4 style="text-align:center;">NO OBJECTION CERTIFICATE</h4>\n<p><strong>Date:</strong> {{date}}</p>\n<p><strong>TO WHOM IT MAY CONCERN</strong></p>\n<p>This is to certify that {{company_name}} has no objection to <strong>{{employee_name}}</strong> for the purpose of <strong>{{purpose}}</strong>.</p>\n<p>This certificate is issued upon the employee's request.</p>\n<br/>\n<p>Sincerely,</p>\n<p><strong>HR Manager</strong></p>	t	2026-07-06 14:32:50.90496
19	Salary Certificate	SALARY_CERT	certificate	<h3 style="text-align:center;">{{company_name}}</h3>\n<h4 style="text-align:center;">SALARY CERTIFICATE</h4>\n<p><strong>Date:</strong> {{date}}</p>\n<p><strong>TO WHOM IT MAY CONCERN</strong></p>\n<p>This is to certify that <strong>{{employee_name}}</strong> is employed with {{company_name}} as <strong>{{position}}</strong> and draws a monthly salary of <strong>{{salary}}</strong>.</p>\n<p>This certificate is issued upon the employee's request for {{purpose}}.</p>\n<br/>\n<p>Sincerely,</p>\n<p><strong>HR Manager</strong></p>	t	2026-07-06 14:32:50.90496
20	Employment Verification Letter	EMP_VERIFY_LTR	letter	<h3 style="text-align:center;">{{company_name}}</h3>\n<h4 style="text-align:center;">EMPLOYMENT VERIFICATION</h4>\n<p><strong>Date:</strong> {{date}}</p>\n<p><strong>TO WHOM IT MAY CONCERN</strong></p>\n<p>This is to verify that <strong>{{employee_name}}</strong> has been employed with {{company_name}} from <strong>{{start_date}}</strong> to <strong>{{end_date}}</strong> holding the position of <strong>{{position}}</strong>.</p>\n<p>This verification is provided at the request of the employee.</p>\n<br/>\n<p>Sincerely,</p>\n<p><strong>HR Manager</strong></p>	t	2026-07-06 14:32:50.90496
21	Internship Offer Letter	INTERN_OFFER_LTR	letter	<h3 style="text-align:center;">{{company_name}}</h3>\n<h4 style="text-align:center;">INTERNSHIP OFFER LETTER</h4>\n<p><strong>Date:</strong> {{date}}</p>\n<p>Dear {{employee_name}},</p>\n<p>We are pleased to offer you an internship position as <strong>{{position}}</strong> in the <strong>{{department}}</strong> Department from <strong>{{start_date}}</strong> to <strong>{{end_date}}</strong>.</p>\n<p>During this period, you will receive a stipend of <strong>{{stipend}}</strong>.</p>\n<p>We look forward to having you on board.</p>\n<br/>\n<p>Sincerely,</p>\n<p><strong>HR Manager</strong></p>	t	2026-07-06 14:32:50.90496
22	Internship Completion Letter	INTERN_COMP_LTR	letter	<h3 style="text-align:center;">{{company_name}}</h3>\n<h4 style="text-align:center;">INTERNSHIP COMPLETION LETTER</h4>\n<p><strong>Date:</strong> {{date}}</p>\n<p>Dear {{employee_name}},</p>\n<p>This is to certify that you have successfully completed your internship as <strong>{{position}}</strong> in the <strong>{{department}}</strong> Department from <strong>{{start_date}}</strong> to <strong>{{end_date}}</strong>.</p>\n<p>We appreciate your contribution during this period and wish you success in your career.</p>\n<br/>\n<p>Sincerely,</p>\n<p><strong>HR Manager</strong></p>	t	2026-07-06 14:32:50.90496
23	Training Nomination Letter	TRAINING_NOM_LTR	letter	<h3 style="text-align:center;">{{company_name}}</h3>\n<h4 style="text-align:center;">TRAINING NOMINATION LETTER</h4>\n<p><strong>Date:</strong> {{date}}</p>\n<p>Dear {{employee_name}},</p>\n<p>We are pleased to nominate you for the <strong>{{training_name}}</strong> training program scheduled from <strong>{{training_start}}</strong> to <strong>{{training_end}}</strong> at <strong>{{training_location}}</strong>.</p>\n<p>Please make the necessary arrangements to attend.</p>\n<br/>\n<p>Sincerely,</p>\n<p><strong>HR Manager</strong></p>	t	2026-07-06 14:32:50.90496
24	Appreciation Letter	APPRECIATION_LTR	letter	<h3 style="text-align:center;">{{company_name}}</h3>\n<h4 style="text-align:center;">APPRECIATION LETTER</h4>\n<p><strong>Date:</strong> {{date}}</p>\n<p>Dear {{employee_name}},</p>\n<p>We would like to express our sincere appreciation for your exceptional performance and dedication, particularly regarding {{achievement}}.</p>\n<p>Your hard work and commitment are truly valued.</p>\n<br/>\n<p>Sincerely,</p>\n<p><strong>HR Manager</strong></p>	t	2026-07-06 14:32:50.90496
25	Employee Clearance Letter	CLEARANCE_LTR_V2	letter	<h3 style="text-align:center;">{{company_name}}</h3>\n<h4 style="text-align:center;">EMPLOYEE CLEARANCE LETTER</h4>\n<p><strong>Date:</strong> {{date}}</p>\n<p>Dear {{employee_name}},</p>\n<p>This is to confirm that you have completed all clearance formalities with the following departments:</p>\n<ul>\n<li>HR Department - {{hr_clearance}}</li>\n<li>Finance Department - {{finance_clearance}}</li>\n<li>IT Department - {{it_clearance}}</li>\n<li>Administration - {{admin_clearance}}</li>\n</ul>\n<p>You have been cleared from all obligations with {{company_name}} effective <strong>{{effective_date}}</strong>.</p>\n<br/>\n<p>Sincerely,</p>\n<p><strong>HR Manager</strong></p>	t	2026-07-06 14:32:50.90496
\.


--
-- Data for Name: employee_banks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_banks (id, employee_id, bank_name, account_number, account_holder, branch, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: employee_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_categories (id, name) FROM stdin;
1	Permanent
\.


--
-- Data for Name: employee_clearance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_clearance (id, employee_id, termination_date, reason, termination_type, status, initiated_by, approved_by, approved_at, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: employee_dependents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_dependents (id, employee_id, full_name, relationship, date_of_birth, phone, created_at) FROM stdin;
\.


--
-- Data for Name: employee_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_documents (id, employee_id, document_type, document_name, file_path, expiry_date, created_at) FROM stdin;
\.


--
-- Data for Name: employee_education; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_education (id, employee_id, institution, degree, field_of_study, start_date, end_date, grade, created_at) FROM stdin;
\.


--
-- Data for Name: employee_hobbies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_hobbies (id, employee_id, hobby, created_at) FROM stdin;
\.


--
-- Data for Name: employee_shifts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_shifts (id, employee_id, shift_id, start_date, end_date, is_recurring, created_at) FROM stdin;
\.


--
-- Data for Name: employee_work_experience; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_work_experience (id, employee_id, company, "position", start_date, end_date, reason_leaving, created_at) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, code, title, first_name, middle_name, last_name, nationality, gender, marital_status, date_of_birth, is_active, tin, biold, passport_id, national_id, category_id, created_at, department_id, position_id, phone, email, address, emergency_contact, emergency_phone, hire_date, salary, updated_at, employment_stage_id, branch, probation_start_date, probation_end_date, contract_end_date, termination_date, termination_reason, branch_id, photo, pension_number, taxable_allowances, clearance_status, termination_type) FROM stdin;
1	EMP-00001-26	ato	Ephrem	abate	Awulachew	ethiopan	Male	Single	1995-11-04	t	0000073015				1	2026-07-06 12:08:41.667211	2	1	0912009497	ephremawlachew299@gmail.com	gullee 2			2018-02-10	30000.00	2026-07-06 13:01:05.533659	5	\N	\N	\N	\N	\N	\N	\N	\N	\N	0.00	not_applicable	\N
\.


--
-- Data for Name: employment_stages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employment_stages (id, name, code, description, is_active) FROM stdin;
1	Probation	PROB	Probation period (max 45 days per Proclamation 1156/2019)	t
2	Contract	CTR	Fixed-term contract	t
3	Permanent	PERM	Permanent/indefinite employment	t
4	Suspended	SUS	Temporary suspension	t
5	Terminated	TERM	Employment terminated	t
\.


--
-- Data for Name: enhanced_payroll; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enhanced_payroll (id, employee_id, pay_period_start, pay_period_end, basic_salary, transport_allowance, housing_allowance, position_allowance, overtime_amount, other_allowances, other_deductions, income_tax, employee_pension, employer_pension, net_pay, status, created_at) FROM stdin;
\.


--
-- Data for Name: generated_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.generated_documents (id, template_id, employee_id, voucher_id, document_type, reference_number, title, content, status, issued_by, issued_at, created_at, created_by) FROM stdin;
1	6	1	\N	letter	DOC-20260706-1434	Bank Transfer Letter - Ephrem Awulachew		generated	\N	\N	2026-07-06 13:52:44.304118	1
2	2	1	\N	letter	DOC-20260706-1789	Termination Letter - Ephrem Awulachew		generated	\N	\N	2026-07-06 13:55:16.951429	1
3	3	1	\N	certificate	DOC-20260706-1322	Work Experience Certificate - Ephrem Awulachew		generated	\N	\N	2026-07-06 14:14:15.503431	1
4	9	1	\N	letter	DOC-20260706-5680	Employment Confirmation Letter - Ephrem Awulachew	<h3 style="text-align:center;">Genius HRMS</h3>\n<h4 style="text-align:center;">CONFIRMATION LETTER</h4>\n<p><strong>Date:</strong> 2026-07-06</p>\n<p>Dear Ephrem Awulachew,</p>\n<p>Following the successful completion of your probation period, we are pleased to confirm your employment as <strong>{{position}}</strong> effective <strong>{{effective_2026-07-06</strong>.</p>\n<p>We appreciate your contribution and look forward to your continued success with the company.</p>\n<br/>\n<p>Sincerely,</p>\n<p><strong>HR Manager</strong></p>	generated	\N	\N	2026-07-06 19:47:51.068184	4
5	25	1	\N	letter	DOC-20260706-4989	Employee Clearance Letter - Ephrem Awulachew	<h3 style="text-align:center;">Genius HRMS</h3>\n<h4 style="text-align:center;">EMPLOYEE CLEARANCE LETTER</h4>\n<p><strong>Date:</strong> 2026-07-06</p>\n<p>Dear Ephrem Awulachew,</p>\n<p>This is to confirm that you have completed all clearance formalities with the following Information Technologys:</p>\n<ul>\n<li>HR Department - {{hr_clearance}}</li>\n<li>Finance Department - {{finance_clearance}}</li>\n<li>IT Department - {{it_clearance}}</li>\n<li>Administration - {{admin_clearance}}</li>\n</ul>\n<p>You have been cleared from all obligations with Genius HRMS effective <strong>{{effective_2026-07-06</strong>.</p>\n<br/>\n<p>Sincerely,</p>\n<p><strong>HR Manager</strong></p>	generated	\N	\N	2026-07-06 19:48:06.507992	4
\.


--
-- Data for Name: item_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item_categories (id, name, description, is_active, created_at, company_id) FROM stdin;
1	Raw Materials	Raw materials for production	t	2026-07-06 15:09:45.993839	1
2	Finished Goods	Finished products ready for sale	t	2026-07-06 15:09:45.993839	1
3	Spare Parts	Spare parts and components	t	2026-07-06 15:09:45.993839	1
4	Consumables	Office consumables and supplies	t	2026-07-06 15:09:45.993839	1
5	Equipment	Tools and equipment	t	2026-07-06 15:09:45.993839	1
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items (id, code, name, description, category_id, unit, cost_price, selling_price, reorder_level, is_active, created_at, updated_at, company_id) FROM stdin;
\.


--
-- Data for Name: leave_definitions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_definitions (id, employee_id, leave_type_id, year, total_days, used_days, created_at) FROM stdin;
\.


--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_requests (id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approved_by, approved_at, created_at) FROM stdin;
1	1	1	2026-07-06	2026-07-06	15	SICK	approved	1	2026-07-06 12:10:14.106345	2026-07-06 12:10:09.222953
\.


--
-- Data for Name: leave_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_types (id, name, code, days_per_year, is_paid, is_active, created_at) FROM stdin;
1	Annual Leave	ANNUAL	20	t	t	2026-07-06 11:45:46.087109
2	Sick Leave	SICK	15	t	t	2026-07-06 11:45:46.087109
3	Personal Leave	PERSONAL	5	f	t	2026-07-06 11:45:46.087109
4	Maternity Leave	MATERNITY	90	t	t	2026-07-06 11:45:46.087109
5	Paternity Leave	PATERNITY	14	t	t	2026-07-06 11:45:46.087109
\.


--
-- Data for Name: membership_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.membership_members (id, company_id, plan_id, full_name, phone, email, id_number, address, photo_url, start_date, end_date, status, notes, created_at, updated_at, customer_id, qr_code) FROM stdin;
5	1	\N	Ephrem Awulachew	0912009497	ephremawlachew299@gmail.com	\N	gullee 2	\N	2026-07-07	2099-12-31	active	\N	2026-07-07 16:25:48.344877	2026-07-07 16:25:48.344877	CUT-001	eyJjaWQiOiJDVVQtMDAxIiwibiI6IkVwaHJlbSBBd3VsYWNoZXciLCJwIjoiMDkxMjAwOTQ5NyIsInRzIjoxNzgzNDMwNzQ4MDMxfQ==
\.


--
-- Data for Name: membership_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.membership_payments (id, company_id, member_id, amount, currency, payment_method, reference, payment_date, notes, created_at) FROM stdin;
\.


--
-- Data for Name: membership_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.membership_plans (id, company_id, name, type, description, duration_days, price, currency, max_members, is_active, created_at, updated_at) FROM stdin;
1	1	Basic Gym	gym	Standard gym access	30	500.00	ETB	100	t	2026-07-06 17:21:58.285844	2026-07-06 17:21:58.285844
2	1	Premium Gym	gym	Full gym + sauna + trainer	30	1500.00	ETB	50	t	2026-07-06 17:21:58.285844	2026-07-06 17:21:58.285844
3	1	Parking Pass	parking	Monthly parking slot	30	800.00	ETB	200	t	2026-07-06 17:21:58.285844	2026-07-06 17:21:58.285844
4	1	Club Membership	club	Social club access	30	2000.00	ETB	\N	t	2026-07-06 17:21:58.285844	2026-07-06 17:21:58.285844
\.


--
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modules (id, code, name, description, icon, is_active, sort_order) FROM stdin;
1	hrms	HRMS	Employee management, payroll, attendance	bi-people	t	1
2	sales	Sales	Orders, invoices, customers, POS	bi-cart3	t	2
3	stock	Stock	Inventory, warehouses, stock control	bi-box-seam	t	3
4	finance	Finance	Ledgers, payments, accounts, budget	bi-cash-stack	t	4
5	production	Production	Manufacturing, BOM, work orders	bi-gear	t	5
6	procurement	Procurement	Purchase orders, suppliers, RFQ	bi-truck	t	6
7	ecommerce	E-Commerce	Online store, products, orders	bi-shop	t	7
8	audit	Audit	Audit trails, activity logs	bi-journal-text	t	8
9	reports	Reports	Analytics, charts, exports	bi-bar-chart	t	9
10	membership	Membership	Membership management, plans, renewals	bi-person-badge	t	10
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, employee_id, title, message, type, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: overtime_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.overtime_records (id, employee_id, date, start_time, end_time, total_hours, rate_multiplier, rate_type, amount, status, approved_by, approved_at, created_at) FROM stdin;
\.


--
-- Data for Name: parking_cameras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parking_cameras (id, company_id, gate_id, name, code, ip_address, port, rtsp_url, direction, status, protocol, confidence_threshold, last_heartbeat, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: parking_gates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parking_gates (id, company_id, name, code, type, direction, status, ip_address, port, serial_port, barrier_open_delay, is_anpr_enabled, is_qr_enabled, is_nfc_enabled, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: parking_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parking_payments (id, company_id, session_id, vehicle_id, amount, currency, payment_method, reference, pos_terminal_id, receipt_number, paid_by, notes, payment_date, created_at) FROM stdin;
1	1	5	\N	50.00	ETB	cash	PAY-001	POS-01	RCP-SES-005	neba	\N	2026-07-07 18:28:18.811857	2026-07-07 18:28:18.811857
2	1	6	\N	100.00	ETB	cash	PAY-002	POS-01	RCP-SES-006	MEAZA	\N	2026-07-07 18:45:02.753788	2026-07-07 18:45:02.753788
3	1	1	\N	390.00	ETB	cash	PAY-003	POS-01	RCP-SES-001	Ephrem Awulachew	\N	2026-07-07 22:59:15.763034	2026-07-07 22:59:15.763034
\.


--
-- Data for Name: parking_qr_tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parking_qr_tickets (id, company_id, ticket_number, qr_code, visitor_name, visitor_phone, visitor_plate, purpose, host_name, host_phone, valid_from, valid_until, is_used, used_at, session_id, status, created_by, created_at) FROM stdin;
1	1	QR-001	eyJ0IjoiUVItMDAxIiwiYyI6MSwibiI6IkVwaHJlbSBBd3VsYWNoZXciLCJ0cyI6MTc4MzQzMjM0NzEzOH0=	Ephrem Awulachew	0912009497	\N	\N	\N	\N	2026-07-07 16:52:27.138	2026-07-08 16:52:27.138	t	2026-07-07 16:52:27.209024	1	active	1	2026-07-07 16:52:27.140852
2	1	QR-002	eyJ0IjoiUVItMDAyIiwiYyI6MSwibiI6ImpvaG4iLCJ0cyI6MTc4MzQzNjEyNTkzM30=	john	0912035032	\N	\N	\N	\N	2026-07-07 17:55:26.056	2026-07-08 17:55:26.056	t	2026-07-07 17:55:26.093795	2	active	1	2026-07-07 17:55:26.05758
3	1	QR-003	eyJ0IjoiUVItMDAzIiwiYyI6MSwibiI6ImpvaG4iLCJ0cyI6MTc4MzQzNzQ4MzA0OX0=	john	0912035032	\N	\N	\N	\N	2026-07-07 18:18:03.107	2026-07-08 18:18:03.107	t	2026-07-07 18:18:03.14108	3	active	1	2026-07-07 18:18:03.108503
4	1	QR-004	eyJ0IjoiUVItMDA0IiwiYyI6MSwibiI6IkVwaHJlbSBBd3VsYWNoZXciLCJ0cyI6MTc4MzQzNzU3NTY4Mn0=	Ephrem Awulachew	0912009497	\N	\N	\N	\N	2026-07-07 18:19:35.725	2026-07-08 18:19:35.725	t	2026-07-07 18:19:35.758567	4	active	1	2026-07-07 18:19:35.72571
5	1	QR-005	eyJ0IjoiUVItMDA1IiwiYyI6MSwibiI6Im5lYmEiLCJ0cyI6MTc4MzQzODA2MTc3NX0=	neba	0913079292	\N	\N	\N	\N	2026-07-07 18:27:41.839	2026-07-08 18:27:41.839	t	2026-07-07 18:27:41.875829	5	active	1	2026-07-07 18:27:41.841162
6	1	QR-006	eyJ0IjoiUVItMDA2IiwiYyI6MSwibiI6Ik1FQVpBIiwidHMiOjE3ODM0MzkwNTI4Mjd9	MEAZA	0913079292	\N	\N	\N	\N	2026-07-07 18:44:12.921	2026-07-08 18:44:12.921	t	2026-07-07 18:44:12.97065	6	active	1	2026-07-07 18:44:12.923348
7	1	QR-007	eyJ0IjoiUVItMDA3IiwiYyI6MSwibiI6Ik1FQVpBIiwidHMiOjE3ODM0NDIxMDc4NDB9	MEAZA	0913079292	\N	\N	\N	\N	2026-07-07 19:35:07.902	2026-07-08 19:35:07.902	t	2026-07-07 19:35:07.946038	7	active	1	2026-07-07 19:35:07.903415
\.


--
-- Data for Name: parking_rates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parking_rates (id, company_id, name, vehicle_type, rate_type, base_rate, per_hour_rate, per_day_rate, grace_period_minutes, max_daily_charge, currency, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: parking_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parking_sessions (id, company_id, vehicle_id, plate_number, entry_gate_id, exit_gate_id, entry_camera_id, exit_camera_id, slot_id, entry_time, exit_time, duration_minutes, entry_image_url, exit_image_url, entry_plate_confidence, exit_plate_confidence, entry_method, exit_method, status, amount, paid, ticket_number, qr_ticket_id, notes, created_at, updated_at) FROM stdin;
2	1	\N	KIO-QR-002	\N	\N	\N	\N	\N	2026-07-07 17:55:26.090798	\N	\N	\N	\N	\N	\N	qr	anpr	active	0.00	f	SES-002	2	Kiosk entry: john	2026-07-07 17:55:26.090798	2026-07-07 17:55:26.090798
3	1	\N	KIO-QR-003	\N	\N	\N	\N	\N	2026-07-07 18:18:03.137121	\N	\N	\N	\N	\N	\N	qr	anpr	active	0.00	f	SES-003	3	Kiosk entry: john	2026-07-07 18:18:03.137121	2026-07-07 18:18:03.137121
4	1	\N	KIO-QR-004	\N	\N	\N	\N	\N	2026-07-07 18:19:35.752809	\N	\N	\N	\N	\N	\N	qr	anpr	active	0.00	f	SES-004	4	Kiosk entry: Ephrem Awulachew	2026-07-07 18:19:35.752809	2026-07-07 18:19:35.752809
5	1	\N	KIO-QR-005	\N	\N	\N	\N	\N	2026-07-07 18:27:41.872117	\N	\N	\N	\N	\N	\N	qr	anpr	completed	50.00	t	SES-005	5	Kiosk entry: neba	2026-07-07 18:27:41.872117	2026-07-07 18:27:41.872117
6	1	\N	KIO-QR-006	\N	\N	\N	\N	\N	2026-07-07 18:44:12.966068	\N	\N	\N	\N	\N	\N	qr	anpr	completed	100.00	t	SES-006	6	Kiosk entry: MEAZA	2026-07-07 18:44:12.966068	2026-07-07 18:44:12.966068
7	1	\N	KIO-QR-007	\N	\N	\N	\N	\N	2026-07-07 19:35:07.941628	\N	\N	\N	\N	\N	\N	qr	anpr	active	0.00	f	SES-007	7	Kiosk entry: MEAZA	2026-07-07 19:35:07.941628	2026-07-07 19:35:07.941628
1	1	\N	KIO-QR-001	\N	\N	\N	\N	1	2026-07-07 16:52:27.195821	\N	\N	\N	\N	\N	\N	qr	anpr	completed	390.00	t	SES-001	1	Kiosk entry via Ephrem Awulachew	2026-07-07 16:52:27.195821	2026-07-07 16:52:27.195821
\.


--
-- Data for Name: parking_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parking_slots (id, company_id, zone_id, slot_number, floor, status, type, current_session_id, created_at, updated_at) FROM stdin;
1	1	1	A	1	available	standard	\N	2026-07-07 16:32:56.747626	2026-07-07 16:32:56.747626
\.


--
-- Data for Name: parking_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parking_subscriptions (id, company_id, customer_id, vehicle_id, plan_type, start_date, end_date, amount, payment_method, payment_reference, status, auto_renew, renewal_count, last_renewed_at, notes, created_by, created_at, updated_at) FROM stdin;
1	1	5	\N	monthly	2026-07-07	2026-07-08	10000.00	cash		active	f	0	\N		1	2026-07-07 16:26:22.536846	2026-07-07 16:26:22.536846
2	1	5	\N	monthly	2026-07-16	2026-08-15	20000.00	cash		active	f	0	\N		1	2026-07-07 16:30:01.458115	2026-07-07 16:30:01.458115
\.


--
-- Data for Name: parking_vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parking_vehicles (id, company_id, plate_number, vehicle_type, vehicle_model, vehicle_color, owner_name, owner_phone, owner_email, rfid_tag, nfc_tag, is_blacklisted, is_resident, subscription_id, notes, created_at, updated_at, customer_id) FROM stdin;
\.


--
-- Data for Name: parking_zones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parking_zones (id, company_id, name, code, floor, description, slot_count, type, is_active, created_at, updated_at) FROM stdin;
1	1	BASMEENT 1 	A	1		1	standard	t	2026-07-07 16:32:31.825138	2026-07-07 16:32:31.825138
\.


--
-- Data for Name: paye_brackets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.paye_brackets (id, min_income, max_income, rate, deductible_amount, is_active, created_at) FROM stdin;
1	0.00	600.00	0.0000	0.00	t	2026-07-06 14:43:15.776152
2	600.01	1650.00	0.1000	60.00	t	2026-07-06 14:43:15.776152
3	1650.01	3200.00	0.1500	142.50	t	2026-07-06 14:43:15.776152
4	3200.01	5250.00	0.2000	302.50	t	2026-07-06 14:43:15.776152
5	5250.01	7800.00	0.2500	565.00	t	2026-07-06 14:43:15.776152
6	7800.01	10900.00	0.3000	955.00	t	2026-07-06 14:43:15.776152
7	10900.01	\N	0.3500	1500.00	t	2026-07-06 14:43:15.776152
\.


--
-- Data for Name: payroll; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payroll (id, employee_id, pay_period_start, pay_period_end, basic_salary, allowances, deductions, net_pay, status, processed_by, processed_at, created_at) FROM stdin;
1	1	2026-06-06	2026-07-07	30000.00	10000.00	35000.00	0.00	paid	1	2026-07-06 12:10:46.411215	2026-07-06 12:10:46.411215
\.


--
-- Data for Name: payroll_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payroll_items (id, name, code, type, is_taxable, is_pensionable, is_active, created_at) FROM stdin;
1	Basic Salary	BASIC	allowance	t	t	t	2026-07-06 12:12:21.09112
2	Transport Allowance	TRANSPORT	allowance	f	f	t	2026-07-06 12:12:21.09112
3	Housing Allowance	HOUSING	allowance	t	t	t	2026-07-06 12:12:21.09112
4	Position Allowance	POSITION	allowance	t	t	t	2026-07-06 12:12:21.09112
5	Overtime	OVERTIME	allowance	t	f	t	2026-07-06 12:12:21.09112
6	Income Tax	TAX	deduction	f	f	t	2026-07-06 12:12:21.09112
7	Employee Pension	EMP_PENSION	deduction	f	f	t	2026-07-06 12:12:21.09112
8	Employer Pension	ER_PENSION	deduction	f	f	t	2026-07-06 12:12:21.09112
\.


--
-- Data for Name: payroll_periods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payroll_periods (id, year, month, start_date, end_date, status, processed_by, processed_at, notes, created_at, updated_at, company_id) FROM stdin;
\.


--
-- Data for Name: payroll_runs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payroll_runs (id, period_id, total_gross, total_paye, total_employee_pension, total_employer_pension, total_deductions, total_net, status, processed_by, processed_at, created_at) FROM stdin;
\.


--
-- Data for Name: pension_contributions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pension_contributions (id, employee_id, payroll_item_id, period_id, employee_contribution, employer_contribution, total_contribution, contribution_date, created_at) FROM stdin;
\.


--
-- Data for Name: pension_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pension_settings (id, employee_rate, employer_rate, is_active, updated_at) FROM stdin;
1	0.0700	0.1100	t	2026-07-06 14:43:15.80272
\.


--
-- Data for Name: performance_evaluations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.performance_evaluations (id, employee_id, reviewer_id, evaluation_date, rating, comments, strengths, improvements, status, created_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, role_id, resource, can_view, can_create, can_edit, can_delete, can_approve) FROM stdin;
\.


--
-- Data for Name: placement_benefits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.placement_benefits (id, placement_id, payroll_item_id, amount, is_percentage, percentage_value, created_at) FROM stdin;
\.


--
-- Data for Name: placements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.placements (id, employee_id, placement_type, employment_stage_id, department_id, position_id, branch, salary, start_date, end_date, reason, previous_placement_id, created_by, created_at) FROM stdin;
1	1	promotion	3	2	1	HEAD OFFICE	40000.00	2026-07-06	2028-07-16	PROMOTION	\N	1	2026-07-06 12:37:30.821253
2	1	termination	5	2	1	\N	\N	2026-07-06	2026-08-06	\N	\N	1	2026-07-06 13:01:05.491898
\.


--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.positions (id, title, department_id, description, min_salary, max_salary, is_active, created_at, company_id) FROM stdin;
1	SENIORS	2		10000.00	30000.00	t	2026-07-06 12:09:40.792417	1
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (id, role_id, resource, can_view, can_create, can_edit, can_delete, can_approve) FROM stdin;
1	1	shifts	t	t	t	t	t
2	1	users	t	t	t	t	t
3	1	placements	t	t	t	t	t
4	1	leave	t	t	t	t	t
5	1	documents	t	t	t	t	t
6	1	attendance	t	t	t	t	t
7	1	performance	t	t	t	t	t
8	1	positions	t	t	t	t	t
9	1	settings	t	t	t	t	t
10	1	payroll	t	t	t	t	t
11	1	departments	t	t	t	t	t
12	1	employees	t	t	t	t	t
13	1	reports	t	t	t	t	t
14	1	branches	t	t	t	t	t
15	1	vouchers	t	t	t	t	t
16	1	overtime	t	t	t	t	t
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, is_active, created_at) FROM stdin;
1	admin	Full system access	t	2026-07-06 13:41:22.052216
2	hr_manager	HR department manager	t	2026-07-06 13:41:22.052216
3	hr_clerk	HR staff	t	2026-07-06 13:41:22.052216
4	finance	Finance department	t	2026-07-06 13:41:22.052216
5	employee	Self-service access only	t	2026-07-06 13:41:22.052216
6	super_admin	Super system administrator - full cross-company access	t	2026-07-06 18:07:32.508084
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, key, value, description, updated_at) FROM stdin;
1	company_name	Genius HRMS	Company name	2026-07-06 11:45:46.083052
2	company_address	123 Business Street	Company address	2026-07-06 11:45:46.083052
3	company_phone	+1-555-1234	Company phone	2026-07-06 11:45:46.083052
4	company_email	info@geniushrms.com	Company email	2026-07-06 11:45:46.083052
5	tax_rate	15	Default tax rate percentage	2026-07-06 11:45:46.083052
7	payroll_frequency	monthly	Payroll frequency	2026-07-06 11:45:46.083052
8	working_days_per_month	22	Standard working days per month	2026-07-06 11:45:46.083052
6	currency	Birr	Currency symbol	2026-07-06 11:45:46.083052
\.


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shifts (id, name, start_time, end_time, description, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: stock_adjustments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_adjustments (id, item_id, warehouse_id, old_quantity, new_quantity, reason, status, approved_by, approved_at, created_by, created_at, company_id) FROM stdin;
\.


--
-- Data for Name: stock_balances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_balances (id, item_id, warehouse_id, quantity, company_id) FROM stdin;
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_movements (id, item_id, warehouse_id, movement_type, quantity, reference_type, reference_id, notes, created_by, created_at, company_id) FROM stdin;
\.


--
-- Data for Name: stock_transfers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_transfers (id, item_id, from_warehouse_id, to_warehouse_id, quantity, status, notes, created_by, approved_by, created_at, completed_at, company_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role, role_id, is_active, phone, branch_id, updated_at, created_at, company_id) FROM stdin;
1	Admin	admin@gmail.com	$2b$10$wOVeDCdc95Bn7/h0RZyiBuQvJw8rYtKCFA2E3Zf.lZvlw9o6vSKX2	admin	1	t	\N	\N	2026-07-06 13:41:22.072795	2026-07-06 13:48:21.59275	1
3	admin	nebiyatsoccer59@gmail.com	$2b$10$ZVAIZjn6aRTaGQdC2PfjFuQupyD6dfHP3YxpHCCgNEtCeVKtitG32	admin	1	t	0912009497	1	2026-07-06 16:40:05.585433	2026-07-06 16:35:30.762968	3
4	Super Admin	admin@genius.com	$2b$10$jZcEf1xfMEC/EBSVSVtjO.khN4eNwV9nKloafCR8..6yzrIHYnSAa	admin	6	t	\N	\N	2026-07-06 18:07:32.775641	2026-07-06 18:07:32.775641	\N
6	Ephrem Awulachew	ephremawlachew299@gmail.com	$2b$10$9q00RsF6FMgtOUDvaVb.jOLqFq0mn2J8jnbZgD4zeaQX1QJngo90O	admin	5	t	0912009497	1	2026-07-06 19:03:19.286283	2026-07-06 19:03:19.286283	3
\.


--
-- Data for Name: voucher_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.voucher_items (id, voucher_id, payroll_item_id, description, quantity, unit_price, created_at) FROM stdin;
\.


--
-- Data for Name: vouchers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vouchers (id, voucher_type, code, employee_id, status, total_amount, notes, prepared_by, approved_by, prepared_at, approved_at, created_at) FROM stdin;
\.


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouses (id, name, code, location, manager, phone, is_active, created_at, company_id) FROM stdin;
1	Main Warehouse	WH-MAIN	Head Office	\N	\N	t	2026-07-06 15:09:46.014136	1
2	Production Warehouse	WH-PROD	Factory	\N	\N	t	2026-07-06 15:09:46.014136	1
3	Showroom	WH-SHOW	Sales Floor	\N	\N	t	2026-07-06 15:09:46.014136	1
\.


--
-- Name: attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attendance_id_seq', 3, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: biometric_devices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.biometric_devices_id_seq', 1, false);


--
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.branches_id_seq', 2, true);


--
-- Name: clearance_item_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clearance_item_status_id_seq', 1, false);


--
-- Name: clearance_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clearance_items_id_seq', 8, true);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.companies_id_seq', 3, true);


--
-- Name: company_modules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.company_modules_id_seq', 13, true);


--
-- Name: demo_licenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.demo_licenses_id_seq', 4, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_id_seq', 5, true);


--
-- Name: document_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.document_templates_id_seq', 25, true);


--
-- Name: employee_banks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employee_banks_id_seq', 1, false);


--
-- Name: employee_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employee_categories_id_seq', 1, false);


--
-- Name: employee_clearance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employee_clearance_id_seq', 1, false);


--
-- Name: employee_dependents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employee_dependents_id_seq', 1, false);


--
-- Name: employee_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employee_documents_id_seq', 1, false);


--
-- Name: employee_education_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employee_education_id_seq', 1, false);


--
-- Name: employee_hobbies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employee_hobbies_id_seq', 1, false);


--
-- Name: employee_shifts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employee_shifts_id_seq', 1, false);


--
-- Name: employee_work_experience_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employee_work_experience_id_seq', 1, false);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_id_seq', 1, true);


--
-- Name: employment_stages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employment_stages_id_seq', 5, true);


--
-- Name: enhanced_payroll_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.enhanced_payroll_id_seq', 1, false);


--
-- Name: generated_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.generated_documents_id_seq', 5, true);


--
-- Name: item_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.item_categories_id_seq', 5, true);


--
-- Name: items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.items_id_seq', 1, false);


--
-- Name: leave_definitions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leave_definitions_id_seq', 1, false);


--
-- Name: leave_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leave_requests_id_seq', 1, true);


--
-- Name: leave_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leave_types_id_seq', 5, true);


--
-- Name: membership_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.membership_members_id_seq', 5, true);


--
-- Name: membership_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.membership_payments_id_seq', 1, false);


--
-- Name: membership_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.membership_plans_id_seq', 4, true);


--
-- Name: modules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.modules_id_seq', 10, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: overtime_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.overtime_records_id_seq', 1, false);


--
-- Name: parking_cameras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parking_cameras_id_seq', 1, false);


--
-- Name: parking_gates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parking_gates_id_seq', 1, false);


--
-- Name: parking_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parking_payments_id_seq', 3, true);


--
-- Name: parking_qr_tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parking_qr_tickets_id_seq', 7, true);


--
-- Name: parking_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parking_rates_id_seq', 1, false);


--
-- Name: parking_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parking_sessions_id_seq', 7, true);


--
-- Name: parking_slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parking_slots_id_seq', 1, true);


--
-- Name: parking_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parking_subscriptions_id_seq', 2, true);


--
-- Name: parking_vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parking_vehicles_id_seq', 1, false);


--
-- Name: parking_zones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parking_zones_id_seq', 1, true);


--
-- Name: paye_brackets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.paye_brackets_id_seq', 7, true);


--
-- Name: payroll_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payroll_id_seq', 1, true);


--
-- Name: payroll_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payroll_items_id_seq', 8, true);


--
-- Name: payroll_periods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payroll_periods_id_seq', 1, false);


--
-- Name: payroll_runs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payroll_runs_id_seq', 1, false);


--
-- Name: pension_contributions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pension_contributions_id_seq', 1, false);


--
-- Name: pension_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pension_settings_id_seq', 1, true);


--
-- Name: performance_evaluations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.performance_evaluations_id_seq', 1, false);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_id_seq', 1, false);


--
-- Name: placement_benefits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.placement_benefits_id_seq', 1, false);


--
-- Name: placements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.placements_id_seq', 2, true);


--
-- Name: positions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.positions_id_seq', 1, true);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 16, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settings_id_seq', 8, true);


--
-- Name: shifts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shifts_id_seq', 1, false);


--
-- Name: stock_adjustments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_adjustments_id_seq', 1, false);


--
-- Name: stock_balances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_balances_id_seq', 1, false);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_movements_id_seq', 1, false);


--
-- Name: stock_transfers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_transfers_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: voucher_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.voucher_items_id_seq', 1, false);


--
-- Name: vouchers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vouchers_id_seq', 1, false);


--
-- Name: warehouses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.warehouses_id_seq', 3, true);


--
-- Name: attendance attendance_employee_id_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_employee_id_date_key UNIQUE (employee_id, date);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: biometric_devices biometric_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biometric_devices
    ADD CONSTRAINT biometric_devices_pkey PRIMARY KEY (id);


--
-- Name: branches branches_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_code_key UNIQUE (code);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: clearance_item_status clearance_item_status_clearance_id_item_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clearance_item_status
    ADD CONSTRAINT clearance_item_status_clearance_id_item_id_key UNIQUE (clearance_id, item_id);


--
-- Name: clearance_item_status clearance_item_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clearance_item_status
    ADD CONSTRAINT clearance_item_status_pkey PRIMARY KEY (id);


--
-- Name: clearance_items clearance_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clearance_items
    ADD CONSTRAINT clearance_items_pkey PRIMARY KEY (id);


--
-- Name: companies companies_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_code_key UNIQUE (code);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: company_modules company_modules_company_id_module_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_modules
    ADD CONSTRAINT company_modules_company_id_module_id_key UNIQUE (company_id, module_id);


--
-- Name: company_modules company_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_modules
    ADD CONSTRAINT company_modules_pkey PRIMARY KEY (id);


--
-- Name: demo_licenses demo_licenses_license_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demo_licenses
    ADD CONSTRAINT demo_licenses_license_key_key UNIQUE (license_key);


--
-- Name: demo_licenses demo_licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demo_licenses
    ADD CONSTRAINT demo_licenses_pkey PRIMARY KEY (id);


--
-- Name: departments departments_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_code_key UNIQUE (code);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: document_templates document_templates_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_templates
    ADD CONSTRAINT document_templates_code_key UNIQUE (code);


--
-- Name: document_templates document_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_templates
    ADD CONSTRAINT document_templates_pkey PRIMARY KEY (id);


--
-- Name: employee_banks employee_banks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_banks
    ADD CONSTRAINT employee_banks_pkey PRIMARY KEY (id);


--
-- Name: employee_categories employee_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_categories
    ADD CONSTRAINT employee_categories_pkey PRIMARY KEY (id);


--
-- Name: employee_clearance employee_clearance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_clearance
    ADD CONSTRAINT employee_clearance_pkey PRIMARY KEY (id);


--
-- Name: employee_dependents employee_dependents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_dependents
    ADD CONSTRAINT employee_dependents_pkey PRIMARY KEY (id);


--
-- Name: employee_documents employee_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_documents
    ADD CONSTRAINT employee_documents_pkey PRIMARY KEY (id);


--
-- Name: employee_education employee_education_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_education
    ADD CONSTRAINT employee_education_pkey PRIMARY KEY (id);


--
-- Name: employee_hobbies employee_hobbies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_hobbies
    ADD CONSTRAINT employee_hobbies_pkey PRIMARY KEY (id);


--
-- Name: employee_shifts employee_shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_shifts
    ADD CONSTRAINT employee_shifts_pkey PRIMARY KEY (id);


--
-- Name: employee_work_experience employee_work_experience_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_work_experience
    ADD CONSTRAINT employee_work_experience_pkey PRIMARY KEY (id);


--
-- Name: employees employees_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_code_key UNIQUE (code);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: employment_stages employment_stages_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employment_stages
    ADD CONSTRAINT employment_stages_code_key UNIQUE (code);


--
-- Name: employment_stages employment_stages_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employment_stages
    ADD CONSTRAINT employment_stages_name_key UNIQUE (name);


--
-- Name: employment_stages employment_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employment_stages
    ADD CONSTRAINT employment_stages_pkey PRIMARY KEY (id);


--
-- Name: enhanced_payroll enhanced_payroll_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enhanced_payroll
    ADD CONSTRAINT enhanced_payroll_pkey PRIMARY KEY (id);


--
-- Name: generated_documents generated_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_pkey PRIMARY KEY (id);


--
-- Name: generated_documents generated_documents_reference_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_reference_number_key UNIQUE (reference_number);


--
-- Name: item_categories item_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_categories
    ADD CONSTRAINT item_categories_pkey PRIMARY KEY (id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: leave_definitions leave_definitions_employee_id_leave_type_id_year_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_definitions
    ADD CONSTRAINT leave_definitions_employee_id_leave_type_id_year_key UNIQUE (employee_id, leave_type_id, year);


--
-- Name: leave_definitions leave_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_definitions
    ADD CONSTRAINT leave_definitions_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: leave_types leave_types_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_code_key UNIQUE (code);


--
-- Name: leave_types leave_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_pkey PRIMARY KEY (id);


--
-- Name: membership_members membership_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_members
    ADD CONSTRAINT membership_members_pkey PRIMARY KEY (id);


--
-- Name: membership_payments membership_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_payments
    ADD CONSTRAINT membership_payments_pkey PRIMARY KEY (id);


--
-- Name: membership_plans membership_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_plans
    ADD CONSTRAINT membership_plans_pkey PRIMARY KEY (id);


--
-- Name: modules modules_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_code_key UNIQUE (code);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: overtime_records overtime_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.overtime_records
    ADD CONSTRAINT overtime_records_pkey PRIMARY KEY (id);


--
-- Name: parking_cameras parking_cameras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_cameras
    ADD CONSTRAINT parking_cameras_pkey PRIMARY KEY (id);


--
-- Name: parking_gates parking_gates_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_gates
    ADD CONSTRAINT parking_gates_code_key UNIQUE (code);


--
-- Name: parking_gates parking_gates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_gates
    ADD CONSTRAINT parking_gates_pkey PRIMARY KEY (id);


--
-- Name: parking_payments parking_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_payments
    ADD CONSTRAINT parking_payments_pkey PRIMARY KEY (id);


--
-- Name: parking_qr_tickets parking_qr_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_qr_tickets
    ADD CONSTRAINT parking_qr_tickets_pkey PRIMARY KEY (id);


--
-- Name: parking_qr_tickets parking_qr_tickets_ticket_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_qr_tickets
    ADD CONSTRAINT parking_qr_tickets_ticket_number_key UNIQUE (ticket_number);


--
-- Name: parking_rates parking_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_rates
    ADD CONSTRAINT parking_rates_pkey PRIMARY KEY (id);


--
-- Name: parking_sessions parking_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_sessions
    ADD CONSTRAINT parking_sessions_pkey PRIMARY KEY (id);


--
-- Name: parking_slots parking_slots_company_id_slot_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_slots
    ADD CONSTRAINT parking_slots_company_id_slot_number_key UNIQUE (company_id, slot_number);


--
-- Name: parking_slots parking_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_slots
    ADD CONSTRAINT parking_slots_pkey PRIMARY KEY (id);


--
-- Name: parking_subscriptions parking_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_subscriptions
    ADD CONSTRAINT parking_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: parking_vehicles parking_vehicles_company_id_plate_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_vehicles
    ADD CONSTRAINT parking_vehicles_company_id_plate_number_key UNIQUE (company_id, plate_number);


--
-- Name: parking_vehicles parking_vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_vehicles
    ADD CONSTRAINT parking_vehicles_pkey PRIMARY KEY (id);


--
-- Name: parking_zones parking_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_zones
    ADD CONSTRAINT parking_zones_pkey PRIMARY KEY (id);


--
-- Name: paye_brackets paye_brackets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paye_brackets
    ADD CONSTRAINT paye_brackets_pkey PRIMARY KEY (id);


--
-- Name: payroll_items payroll_items_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_items
    ADD CONSTRAINT payroll_items_code_key UNIQUE (code);


--
-- Name: payroll_items payroll_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_items
    ADD CONSTRAINT payroll_items_pkey PRIMARY KEY (id);


--
-- Name: payroll_periods payroll_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_periods
    ADD CONSTRAINT payroll_periods_pkey PRIMARY KEY (id);


--
-- Name: payroll_periods payroll_periods_year_month_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_periods
    ADD CONSTRAINT payroll_periods_year_month_key UNIQUE (year, month);


--
-- Name: payroll payroll_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT payroll_pkey PRIMARY KEY (id);


--
-- Name: payroll_runs payroll_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT payroll_runs_pkey PRIMARY KEY (id);


--
-- Name: pension_contributions pension_contributions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pension_contributions
    ADD CONSTRAINT pension_contributions_pkey PRIMARY KEY (id);


--
-- Name: pension_settings pension_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pension_settings
    ADD CONSTRAINT pension_settings_pkey PRIMARY KEY (id);


--
-- Name: performance_evaluations performance_evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.performance_evaluations
    ADD CONSTRAINT performance_evaluations_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_role_id_resource_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_role_id_resource_key UNIQUE (role_id, resource);


--
-- Name: placement_benefits placement_benefits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.placement_benefits
    ADD CONSTRAINT placement_benefits_pkey PRIMARY KEY (id);


--
-- Name: placements placements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.placements
    ADD CONSTRAINT placements_pkey PRIMARY KEY (id);


--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_role_id_resource_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_resource_key UNIQUE (role_id, resource);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: settings settings_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_key UNIQUE (key);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (id);


--
-- Name: stock_adjustments stock_adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_pkey PRIMARY KEY (id);


--
-- Name: stock_balances stock_balances_item_id_warehouse_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_balances
    ADD CONSTRAINT stock_balances_item_id_warehouse_id_key UNIQUE (item_id, warehouse_id);


--
-- Name: stock_balances stock_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_balances
    ADD CONSTRAINT stock_balances_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: stock_transfers stock_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: voucher_items voucher_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voucher_items
    ADD CONSTRAINT voucher_items_pkey PRIMARY KEY (id);


--
-- Name: vouchers vouchers_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_code_key UNIQUE (code);


--
-- Name: vouchers vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: idx_companies_tin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_companies_tin ON public.companies USING btree (tin) WHERE ((tin IS NOT NULL) AND ((tin)::text <> ''::text));


--
-- Name: idx_items_code_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_items_code_company ON public.items USING btree (code, company_id);


--
-- Name: idx_membership_members_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_membership_members_customer_id ON public.membership_members USING btree (company_id, customer_id) WHERE (customer_id IS NOT NULL);


--
-- Name: idx_parking_payments_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_parking_payments_session ON public.parking_payments USING btree (session_id);


--
-- Name: idx_parking_qr_tickets_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_parking_qr_tickets_code ON public.parking_qr_tickets USING btree (qr_code);


--
-- Name: idx_parking_sessions_entry; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_parking_sessions_entry ON public.parking_sessions USING btree (entry_time);


--
-- Name: idx_parking_sessions_plate; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_parking_sessions_plate ON public.parking_sessions USING btree (plate_number);


--
-- Name: idx_parking_sessions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_parking_sessions_status ON public.parking_sessions USING btree (status);


--
-- Name: idx_parking_sessions_vehicle; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_parking_sessions_vehicle ON public.parking_sessions USING btree (vehicle_id);


--
-- Name: idx_parking_slots_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_parking_slots_status ON public.parking_slots USING btree (status);


--
-- Name: idx_parking_slots_zone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_parking_slots_zone ON public.parking_slots USING btree (zone_id);


--
-- Name: idx_parking_subscriptions_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_parking_subscriptions_customer ON public.parking_subscriptions USING btree (customer_id);


--
-- Name: idx_parking_subscriptions_dates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_parking_subscriptions_dates ON public.parking_subscriptions USING btree (start_date, end_date);


--
-- Name: idx_parking_subscriptions_vehicle; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_parking_subscriptions_vehicle ON public.parking_subscriptions USING btree (vehicle_id);


--
-- Name: idx_parking_vehicles_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_parking_vehicles_customer ON public.parking_vehicles USING btree (customer_id);


--
-- Name: idx_parking_vehicles_plate; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_parking_vehicles_plate ON public.parking_vehicles USING btree (plate_number);


--
-- Name: idx_warehouses_code_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_warehouses_code_company ON public.warehouses USING btree (code, company_id);


--
-- Name: attendance attendance_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: branches branches_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: clearance_item_status clearance_item_status_clearance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clearance_item_status
    ADD CONSTRAINT clearance_item_status_clearance_id_fkey FOREIGN KEY (clearance_id) REFERENCES public.employee_clearance(id) ON DELETE CASCADE;


--
-- Name: clearance_item_status clearance_item_status_completed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clearance_item_status
    ADD CONSTRAINT clearance_item_status_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES public.users(id);


--
-- Name: clearance_item_status clearance_item_status_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clearance_item_status
    ADD CONSTRAINT clearance_item_status_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.clearance_items(id);


--
-- Name: company_modules company_modules_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_modules
    ADD CONSTRAINT company_modules_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_modules company_modules_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_modules
    ADD CONSTRAINT company_modules_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id);


--
-- Name: demo_licenses demo_licenses_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demo_licenses
    ADD CONSTRAINT demo_licenses_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: demo_licenses demo_licenses_issued_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demo_licenses
    ADD CONSTRAINT demo_licenses_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES public.users(id);


--
-- Name: departments departments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: departments departments_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: employee_banks employee_banks_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_banks
    ADD CONSTRAINT employee_banks_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_clearance employee_clearance_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_clearance
    ADD CONSTRAINT employee_clearance_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: employee_clearance employee_clearance_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_clearance
    ADD CONSTRAINT employee_clearance_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_clearance employee_clearance_initiated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_clearance
    ADD CONSTRAINT employee_clearance_initiated_by_fkey FOREIGN KEY (initiated_by) REFERENCES public.users(id);


--
-- Name: employee_dependents employee_dependents_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_dependents
    ADD CONSTRAINT employee_dependents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_documents employee_documents_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_documents
    ADD CONSTRAINT employee_documents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_education employee_education_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_education
    ADD CONSTRAINT employee_education_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_hobbies employee_hobbies_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_hobbies
    ADD CONSTRAINT employee_hobbies_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_shifts employee_shifts_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_shifts
    ADD CONSTRAINT employee_shifts_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_shifts employee_shifts_shift_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_shifts
    ADD CONSTRAINT employee_shifts_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES public.shifts(id);


--
-- Name: employee_work_experience employee_work_experience_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_work_experience
    ADD CONSTRAINT employee_work_experience_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employees employees_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: employees employees_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.employee_categories(id);


--
-- Name: employees employees_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: employees employees_employment_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_employment_stage_id_fkey FOREIGN KEY (employment_stage_id) REFERENCES public.employment_stages(id);


--
-- Name: employees employees_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id) ON DELETE SET NULL;


--
-- Name: enhanced_payroll enhanced_payroll_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enhanced_payroll
    ADD CONSTRAINT enhanced_payroll_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: generated_documents generated_documents_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: generated_documents generated_documents_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: generated_documents generated_documents_issued_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES public.users(id);


--
-- Name: generated_documents generated_documents_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.document_templates(id);


--
-- Name: generated_documents generated_documents_voucher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.vouchers(id);


--
-- Name: item_categories item_categories_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_categories
    ADD CONSTRAINT item_categories_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: items items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.item_categories(id);


--
-- Name: items items_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: leave_definitions leave_definitions_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_definitions
    ADD CONSTRAINT leave_definitions_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: leave_definitions leave_definitions_leave_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_definitions
    ADD CONSTRAINT leave_definitions_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id);


--
-- Name: leave_requests leave_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: leave_requests leave_requests_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: leave_requests leave_requests_leave_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id) ON DELETE CASCADE;


--
-- Name: membership_members membership_members_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_members
    ADD CONSTRAINT membership_members_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: membership_members membership_members_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_members
    ADD CONSTRAINT membership_members_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.membership_plans(id) ON DELETE RESTRICT;


--
-- Name: membership_payments membership_payments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_payments
    ADD CONSTRAINT membership_payments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: membership_payments membership_payments_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_payments
    ADD CONSTRAINT membership_payments_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.membership_members(id) ON DELETE CASCADE;


--
-- Name: membership_plans membership_plans_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_plans
    ADD CONSTRAINT membership_plans_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: overtime_records overtime_records_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.overtime_records
    ADD CONSTRAINT overtime_records_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: overtime_records overtime_records_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.overtime_records
    ADD CONSTRAINT overtime_records_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: parking_cameras parking_cameras_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_cameras
    ADD CONSTRAINT parking_cameras_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: parking_cameras parking_cameras_gate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_cameras
    ADD CONSTRAINT parking_cameras_gate_id_fkey FOREIGN KEY (gate_id) REFERENCES public.parking_gates(id) ON DELETE SET NULL;


--
-- Name: parking_gates parking_gates_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_gates
    ADD CONSTRAINT parking_gates_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: parking_payments parking_payments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_payments
    ADD CONSTRAINT parking_payments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: parking_payments parking_payments_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_payments
    ADD CONSTRAINT parking_payments_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.parking_sessions(id) ON DELETE CASCADE;


--
-- Name: parking_payments parking_payments_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_payments
    ADD CONSTRAINT parking_payments_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.parking_vehicles(id) ON DELETE SET NULL;


--
-- Name: parking_qr_tickets parking_qr_tickets_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_qr_tickets
    ADD CONSTRAINT parking_qr_tickets_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: parking_qr_tickets parking_qr_tickets_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_qr_tickets
    ADD CONSTRAINT parking_qr_tickets_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: parking_qr_tickets parking_qr_tickets_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_qr_tickets
    ADD CONSTRAINT parking_qr_tickets_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.parking_sessions(id) ON DELETE SET NULL;


--
-- Name: parking_rates parking_rates_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_rates
    ADD CONSTRAINT parking_rates_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: parking_sessions parking_sessions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_sessions
    ADD CONSTRAINT parking_sessions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: parking_sessions parking_sessions_entry_camera_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_sessions
    ADD CONSTRAINT parking_sessions_entry_camera_id_fkey FOREIGN KEY (entry_camera_id) REFERENCES public.parking_cameras(id) ON DELETE SET NULL;


--
-- Name: parking_sessions parking_sessions_entry_gate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_sessions
    ADD CONSTRAINT parking_sessions_entry_gate_id_fkey FOREIGN KEY (entry_gate_id) REFERENCES public.parking_gates(id) ON DELETE SET NULL;


--
-- Name: parking_sessions parking_sessions_exit_camera_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_sessions
    ADD CONSTRAINT parking_sessions_exit_camera_id_fkey FOREIGN KEY (exit_camera_id) REFERENCES public.parking_cameras(id) ON DELETE SET NULL;


--
-- Name: parking_sessions parking_sessions_exit_gate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_sessions
    ADD CONSTRAINT parking_sessions_exit_gate_id_fkey FOREIGN KEY (exit_gate_id) REFERENCES public.parking_gates(id) ON DELETE SET NULL;


--
-- Name: parking_sessions parking_sessions_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_sessions
    ADD CONSTRAINT parking_sessions_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.parking_slots(id) ON DELETE SET NULL;


--
-- Name: parking_sessions parking_sessions_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_sessions
    ADD CONSTRAINT parking_sessions_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.parking_vehicles(id) ON DELETE SET NULL;


--
-- Name: parking_slots parking_slots_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_slots
    ADD CONSTRAINT parking_slots_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: parking_slots parking_slots_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_slots
    ADD CONSTRAINT parking_slots_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.parking_zones(id) ON DELETE CASCADE;


--
-- Name: parking_subscriptions parking_subscriptions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_subscriptions
    ADD CONSTRAINT parking_subscriptions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: parking_subscriptions parking_subscriptions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_subscriptions
    ADD CONSTRAINT parking_subscriptions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: parking_subscriptions parking_subscriptions_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_subscriptions
    ADD CONSTRAINT parking_subscriptions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.membership_members(id) ON DELETE CASCADE;


--
-- Name: parking_subscriptions parking_subscriptions_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_subscriptions
    ADD CONSTRAINT parking_subscriptions_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.parking_vehicles(id) ON DELETE SET NULL;


--
-- Name: parking_vehicles parking_vehicles_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_vehicles
    ADD CONSTRAINT parking_vehicles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: parking_vehicles parking_vehicles_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_vehicles
    ADD CONSTRAINT parking_vehicles_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.membership_members(id) ON DELETE SET NULL;


--
-- Name: parking_zones parking_zones_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parking_zones
    ADD CONSTRAINT parking_zones_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: payroll payroll_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT payroll_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: payroll_periods payroll_periods_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_periods
    ADD CONSTRAINT payroll_periods_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: payroll_periods payroll_periods_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_periods
    ADD CONSTRAINT payroll_periods_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(id);


--
-- Name: payroll payroll_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT payroll_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: payroll_runs payroll_runs_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT payroll_runs_period_id_fkey FOREIGN KEY (period_id) REFERENCES public.payroll_periods(id);


--
-- Name: payroll_runs payroll_runs_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT payroll_runs_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(id);


--
-- Name: pension_contributions pension_contributions_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pension_contributions
    ADD CONSTRAINT pension_contributions_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: pension_contributions pension_contributions_payroll_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pension_contributions
    ADD CONSTRAINT pension_contributions_payroll_item_id_fkey FOREIGN KEY (payroll_item_id) REFERENCES public.payroll_items(id);


--
-- Name: pension_contributions pension_contributions_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pension_contributions
    ADD CONSTRAINT pension_contributions_period_id_fkey FOREIGN KEY (period_id) REFERENCES public.payroll_periods(id);


--
-- Name: performance_evaluations performance_evaluations_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.performance_evaluations
    ADD CONSTRAINT performance_evaluations_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: performance_evaluations performance_evaluations_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.performance_evaluations
    ADD CONSTRAINT performance_evaluations_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- Name: permissions permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: placement_benefits placement_benefits_payroll_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.placement_benefits
    ADD CONSTRAINT placement_benefits_payroll_item_id_fkey FOREIGN KEY (payroll_item_id) REFERENCES public.payroll_items(id);


--
-- Name: placement_benefits placement_benefits_placement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.placement_benefits
    ADD CONSTRAINT placement_benefits_placement_id_fkey FOREIGN KEY (placement_id) REFERENCES public.placements(id) ON DELETE CASCADE;


--
-- Name: placements placements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.placements
    ADD CONSTRAINT placements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: placements placements_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.placements
    ADD CONSTRAINT placements_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: placements placements_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.placements
    ADD CONSTRAINT placements_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: placements placements_employment_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.placements
    ADD CONSTRAINT placements_employment_stage_id_fkey FOREIGN KEY (employment_stage_id) REFERENCES public.employment_stages(id);


--
-- Name: placements placements_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.placements
    ADD CONSTRAINT placements_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id);


--
-- Name: placements placements_previous_placement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.placements
    ADD CONSTRAINT placements_previous_placement_id_fkey FOREIGN KEY (previous_placement_id) REFERENCES public.placements(id);


--
-- Name: positions positions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: positions positions_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: stock_adjustments stock_adjustments_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: stock_adjustments stock_adjustments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: stock_adjustments stock_adjustments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: stock_adjustments stock_adjustments_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: stock_adjustments stock_adjustments_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: stock_balances stock_balances_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_balances
    ADD CONSTRAINT stock_balances_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: stock_balances stock_balances_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_balances
    ADD CONSTRAINT stock_balances_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;


--
-- Name: stock_balances stock_balances_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_balances
    ADD CONSTRAINT stock_balances_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id) ON DELETE CASCADE;


--
-- Name: stock_movements stock_movements_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: stock_movements stock_movements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: stock_movements stock_movements_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: stock_movements stock_movements_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: stock_transfers stock_transfers_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: stock_transfers stock_transfers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: stock_transfers stock_transfers_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: stock_transfers stock_transfers_from_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_from_warehouse_id_fkey FOREIGN KEY (from_warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: stock_transfers stock_transfers_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: stock_transfers stock_transfers_to_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_to_warehouse_id_fkey FOREIGN KEY (to_warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: users users_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: voucher_items voucher_items_payroll_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voucher_items
    ADD CONSTRAINT voucher_items_payroll_item_id_fkey FOREIGN KEY (payroll_item_id) REFERENCES public.payroll_items(id);


--
-- Name: voucher_items voucher_items_voucher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voucher_items
    ADD CONSTRAINT voucher_items_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.vouchers(id) ON DELETE CASCADE;


--
-- Name: vouchers vouchers_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: vouchers vouchers_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: vouchers vouchers_prepared_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_prepared_by_fkey FOREIGN KEY (prepared_by) REFERENCES public.users(id);


--
-- Name: warehouses warehouses_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- PostgreSQL database dump complete
--

\unrestrict CzDOxUTnBT9n0BDYccHfQC0jHWGKgL08qegQT7q5FkipNjFqLikyb53Aj0gIpPT

