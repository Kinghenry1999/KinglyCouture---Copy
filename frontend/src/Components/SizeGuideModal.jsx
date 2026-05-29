// src/Components/SizeGuideModal.jsx
import React from "react";
import { Modal, Button, Table } from "react-bootstrap";
import "../styles/Home.css"; // reuses existing modal styles

const SizeGuideModal = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="modal-premium">
      <Modal.Header closeButton>
        <Modal.Title>Size Guide – Kingly Stores</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5 className="mb-3">Men’s Clothing Sizes</h5>
        <p className="text-muted small mb-4">Find your perfect fit with our size chart below.</p>

        <h6>Shirts & Jackets (Chest in inches)</h6>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Size</th>
              <th>XS</th>
              <th>S</th>
              <th>M</th>
              <th>L</th>
              <th>XL</th>
              <th>XXL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Chest</td>
              <td>34-36</td>
              <td>36-38</td>
              <td>38-40</td>
              <td>40-42</td>
              <td>42-44</td>
              <td>44-46</td>
            </tr>
            <tr>
              <td>Waist</td>
              <td>28-30</td>
              <td>30-32</td>
              <td>32-34</td>
              <td>34-36</td>
              <td>36-38</td>
              <td>38-40</td>
            </tr>
          </tbody>
        </Table>

        <h6 className="mt-4">Trousers (Waist in inches)</h6>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Size</th>
              <th>28</th>
              <th>30</th>
              <th>32</th>
              <th>34</th>
              <th>36</th>
              <th>38</th>
              <th>40</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Waist</td>
              <td>28</td>
              <td>30</td>
              <td>32</td>
              <td>34</td>
              <td>36</td>
              <td>38</td>
              <td>40</td>
            </tr>
            <tr>
              <td>Inseam</td>
              <td>30</td>
              <td>31</td>
              <td>32</td>
              <td>33</td>
              <td>34</td>
              <td>34</td>
              <td>35</td>
            </tr>
          </tbody>
        </Table>

        <h6 className="mt-4">Shoes (UK sizes)</h6>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>UK</th>
              <th>6</th>
              <th>7</th>
              <th>8</th>
              <th>9</th>
              <th>10</th>
              <th>11</th>
              <th>12</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>US</td>
              <td>7</td>
              <td>8</td>
              <td>9</td>
              <td>10</td>
              <td>11</td>
              <td>12</td>
              <td>13</td>
            </tr>
            <tr>
              <td>EU</td>
              <td>40</td>
              <td>41</td>
              <td>42</td>
              <td>43</td>
              <td>44</td>
              <td>45</td>
              <td>46</td>
            </tr>
          </tbody>
        </Table>

        <p className="text-muted small mt-3">
          * If you’re between sizes, we recommend ordering the larger size for a comfortable fit.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SizeGuideModal;