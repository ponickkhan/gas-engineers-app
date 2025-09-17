-- Seed data for development and testing
-- This file contains sample data to help with development

-- Note: In a real application, you would not seed user data
-- This is just for development purposes

-- Sample client data (will be associated with actual users when they sign up)
-- These are just examples of the data structure

-- Example JSONB structures for reference:

-- Appliance structure:
-- {
--   "location": "Kitchen",
--   "type": "Cooker",
--   "manufacturer": "Bauknecht",
--   "model": "ABC123",
--   "owned_by_landlord": "No",
--   "appliance_inspected": "Yes",
--   "flue_type": "Flueless"
-- }

-- Inspection detail structure:
-- {
--   "operating_pressure": "20mb kW/h",
--   "safety_devices": "Yes",
--   "ventilation": "Yes",
--   "flue_condition": "Pass",
--   "flue_operation": "Pass",
--   "combustion_reading": "N/A",
--   "appliance_serviced": "No",
--   "safe_to_use": "Yes",
--   "visual_inspection_only": "Yes"
-- }

-- Final check results structure:
-- {
--   "gas_tightness_test": "Pass",
--   "protective_bonding": "Yes",
--   "emergency_control": "Yes",
--   "pipework_inspection": "Yes",
--   "co_alarm": "Yes",
--   "smoke_alarm": "N/A",
--   "notes": ""
-- }

-- Defects/Remedial structure:
-- {
--   "defects_identified": "No",
--   "remedial_work": "N/A",
--   "label_warning": "N/A",
--   "co_low": "N/A",
--   "co2_ratio_low": "N/A",
--   "co_high": "N/A",
--   "co2_ratio_high": "N/A"
-- }

-- Invoice line item structure:
-- {
--   "description": "Gas Safety Check",
--   "quantity": 1,
--   "unit_price": 75.00,
--   "vat_rate": 20,
--   "line_total": 90.00
-- }

-- Contact details structure:
-- {
--   "name": "John Doe",
--   "address": "123 Main Street",
--   "city": "London",
--   "postcode": "SW1A 1AA",
--   "contact_number": "020 1234 5678",
--   "email": "john@example.com"
-- }

-- Service checklist structures:
-- Installation checks:
-- {
--   "meter_cylinder": "Pass",
--   "visible_pipework": "Pass",
--   "ecv_access": "Pass",
--   "protective_bonding": "Pass",
--   "tightness_test": "Pass"
-- }

-- Appliance checks:
-- {
--   "gas_connection": "Pass",
--   "electrical_connection": "Pass",
--   "water_connection": "Pass",
--   "overall_condition": "Pass",
--   "heat_exchanger": "Pass",
--   "burner_injectors": "Pass",
--   "fans": "Pass",
--   "ignition": "Pass",
--   "flame_picture": "Pass",
--   "safety_devices": "Pass",
--   "heat_input": {"kw": "", "kwh": "", "mbar": ""},
--   "seals": "Pass",
--   "condensate": "Pass",
--   "pressure_relief": "Pass",
--   "return_air": "Pass",
--   "fireplace": "Pass",
--   "flue_spillage": "Pass",
--   "chimney_flue": "Pass",
--   "ventilation": "Pass",
--   "combustion_reading": {"co": "", "co2_ratio": "", "o2": ""}
-- }

-- Safety summary:
-- {
--   "safe_to_use": "Yes",
--   "giusp_classification": "None",
--   "warning_notice": ""
-- }

-- This seed file is mainly for documentation of the expected data structures
-- Actual seed data would be added here for development/testing purposes