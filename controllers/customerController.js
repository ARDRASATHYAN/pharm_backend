exports.createCustomer = async (req, res) => {
    try {
        const { customer_name , address, gst_no, phone, email, doctor_name ,prescription_no } = req.body;    
        const newCustomer = await req.db.Customer.create({
            customer_name,
            address: address || null,   
            gst_no: gst_no || null,
            phone: phone || null,
            email: email || null,   
            doctor_name: doctor_name || null,
            prescription_no: prescription_no || null,
        });
        res.status(201).json({ message: 'Customer created successfully', data: newCustomer });
    } catch (error) {
        console.error('Error creating Customer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }   
};
// get all customers
exports.getAllCustomers = async (req, res) => {
    try {
        const customerList = await req.db.Customer.findAll();
        res.status(200).json({ data: customerList });
    } catch (error) {           
        console.error('Error fetching Customers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }   
};

// get customer by id
exports.getCustomerById = async (req, res) => {
    try {   
        const { id } = req.params;
        const customer = await req.db.Customer.findByPk(id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }   

        res.status(200).json({ data: customer });
    } catch (error) {
        console.error('Error fetching Customer by ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }   
};
// update customer
exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { customer_name, address, gst_no, phone, email, doctor_name, prescription_no } = req.body;        
        const customer = await req.db.Customer.findByPk(id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }   
        if (customer_name !== undefined) customer.customer_name = customer_name;
        if (address !== undefined) customer.address = address;
        if (gst_no !== undefined) customer.gst_no = gst_no;     
        if (phone !== undefined) customer.phone = phone;    
        if (email !== undefined) customer.email = email;
        if (doctor_name !== undefined) customer.doctor_name = doctor_name;
        if (prescription_no !== undefined) customer.prescription_no = prescription_no;        
        await customer.save();
        res.status(200).json({ message: 'Customer updated successfully', data: customer });
    }
    catch (error) {
        console.error('Error updating Customer:', error);

        res.status(500).json({ message: 'Internal server error' });
    }
};

// delete customer
exports.deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;  
        const customer = await req.db.Customer.findByPk(id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }   
        await customer.destroy();
        res.status(200).json({ message: 'Customer deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting Customer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }   
};
