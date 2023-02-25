import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Firebase
import {
  //deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
// CSS
import "../../../../assets/css/Collection.scss";
// Services
import FirebaseService from "../../../../services/firebase-service.js";
import CollectionService from "../../../../services/collection-service.js";
// Images
import Plus from "../../../../assets/img/plus-icon.png";

function CollectionsLibrary() {
  const navigate = useNavigate();
  const initialCollectionState = {
    id: null,
    description: "",
    imageURL: "",
    title: "",
  };
  const [collection, setCollection] = useState(initialCollectionState);
  const [collections, setCollections] = useState([]);
  const [currentCollection, setCurrentCollection] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [image, setImage] = useState(null);

  // retrieve all Collections
  const retrieveCollections = () => {
    CollectionService.getAll()
      .then((res) => {
        setCollections(res.data);
        console.log("All the collections:", res.data);
      })
      .catch((err) => {
        console.log("Error while retrieving all the collections:", err);
      });
  };

  // display all Collections
  useEffect(() => {
    retrieveCollections();
  }, []);

  // refresh Collections Library
  const refreshLibrary = () => {
    retrieveCollections();
    setCurrentCollection(null);
    setCurrentIndex(-1);
  };

  // catch current Collection
  const setActiveCollection = (collection, index) => {
    setCurrentCollection(collection);
    setCurrentIndex(index);
  };

  // get Input Values
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCollection({ ...collection, [name]: value });
  };
  const handleImageInput = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  // save Collection
  const handleCollection = () => {
    const imageRef = ref(FirebaseService.storage, `collections/${image.name}`);
    // save to storage
    uploadBytes(imageRef, image)
      .then(() => {
        console.log("Collection file uploaded to storage!");
        // retrieve from storage
        getDownloadURL(imageRef)
          .then((url) => {
            collection.imageURL = url;
            console.log("Collection file downloaded from storage!");
            setImage(null);
            let data = {
              description: collection.description,
              imageURL: collection.imageURL,
              title: collection.title,
            };
            // save to database
            CollectionService.create(data)
              .then((res) => {
                setCollection({
                  id: res.data.id,
                  description: res.data.description,
                  imageURL: res.data.imageURL,
                  title: res.data.title,
                });
                console.log("The new Collection:", res.data);
                setCollection(initialCollectionState);
              })
              .catch((err) => {
                console.log("Error while creating the new Collection:", err);
              });
          })
          .catch((err) => {
            console.log("Error while downloading:", err);
          });
      })
      .catch((err) => {
        console.log("Error while uploading:", err);
      });
  };

  /*
  // delete Collection File from storage
  const deleteImage = () => {
    const imageRef = ref(FirebaseService.storage, `collections/${image.name}`);
    deleteObject(imageRef)
      .then(() => {
        console.log("Collection file deleted successfully!");
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  };
  */

  // delete all Collections from database
  const removeAllCollections = () => {
    CollectionService.removeAll()
      .then((res) => {
        console.log("All collections have been removed:", res.data);
        refreshLibrary();
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  };

  // Render
  return (
    <div>
      <button className="btn button float-end" onClick={removeAllCollections}>
        Empty Library
      </button>
      <div className="grid-collections p-5">
        <button
          type="button"
          className="btn button size-button-180"
          data-bs-toggle="modal"
          data-bs-target="#exampleModal"
        >
          <img src={Plus} alt="plus-icon" width="70" />
        </button>

        <div
          className="modal fade bg-modal"
          id="exampleModal"
          tabIndex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content bg-modal-content border-0">
              <div className="modal-header bg-modal-header border-0 shadow-sm">
                <h1 className="modal-title fs-5" id="exampleModalLabel">
                  New Collection
                </h1>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    value={collection.title}
                    onChange={handleInputChange}
                    name="title"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <input
                    type="text"
                    className="form-control"
                    id="description"
                    value={collection.description}
                    onChange={handleInputChange}
                    name="description"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="imageURL">Collection</label>
                  <input
                    type="file"
                    accept="images/*"
                    multiple={false}
                    className="form-control"
                    id="imageURL"
                    required
                    onChange={handleImageInput}
                    name="imageURL"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn button"
                  onClick={handleCollection}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>

        {collections.map((collection, index) => (
          <div
            id="collections"
            className={index === currentIndex ? "active" : ""}
            onMouseOver={() => setActiveCollection(collection, index)}
            onMouseOut={() => setActiveCollection(null, -1)}
            onDoubleClick={() => navigate("..")}
            key={index}
          >
            <img
              src={collection.imageURL}
              alt={collection.title}
              className="h-collection"
            />
            <p></p>
            <span>
              <div>
                <label>Title:</label> {collection.title}
              </div>
              <div>
                <label>Description:</label> {collection.description}
              </div>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CollectionsLibrary;