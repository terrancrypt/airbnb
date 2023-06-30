'use client';

import useRegisterModal from '@/hooks/useRegisterModal';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AiFillGithub } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';
import { FieldValues, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import Modal from './Modal';
import Heading from '../Heading';
import Input from '../inputs/Input';
import { toast } from 'react-hot-toast';
import Button from '../Button';
import { IoLogoGithub } from 'react-icons/io';

const RegisterModal = () => {
    const registerModal = useRegisterModal();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FieldValues>({
        defaultValues: {
            name: '',
            email: '',
            password: '',
        },
    });

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setIsLoading(true);

        axios
            .post('api/user/register', data)
            .then((res) => {
                registerModal.onClose();
            })
            .catch((err) => {
                console.log(err);
                toast.error('Some thing went wrong');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <Heading title="Welcome to Airbnb" subtitle="Create on account!" />
            <Input id="email" label="Email" register={register} errors={errors} required />
            <Input id="name" label="Name" register={register} errors={errors} required />
            <Input
                id="password"
                type="password"
                label="Password"
                register={register}
                errors={errors}
                required
            />
        </div>
    );

    const footerContent = (
        <div className="flex flex-col gap-4 mt-3">
            <hr />
            <Button outline label="Continue with Google" icon={FcGoogle} onClick={() => {}} />
            <Button outline label="Continue with Github" icon={IoLogoGithub} onClick={() => {}} />
            <div
                className="
                text-neutral-500
                text-center
                mt-4
                font-light
                "
            >
                <div className="flex flex-row justify-center items-center gap-2">
                    <div>Already have an account?</div>
                    <div
                        onClick={registerModal.onClose}
                        className="
                        text-neutral-800
                        cursor-pointer
                        hover:underline
                        "
                    >
                        Login
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <Modal
            disabled={isLoading}
            isOpen={registerModal.isOpen}
            title="Register"
            actionLabel="Continue"
            onClose={registerModal.onClose}
            onSubmit={handleSubmit(onSubmit)}
            body={bodyContent}
            footer={footerContent}
        />
    );
};

export default RegisterModal;
